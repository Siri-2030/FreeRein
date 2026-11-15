/**
 * Entity adapter.
 *
 * The pages talk in the app's own vocabulary (snake_case: request_type, requester_email,
 * safe_places ...). This file translates that to / from the Spring Boot REST API, so
 * every page stores its data in the PostgreSQL database through the backend.
 *
 *   createEntityApi('SupportRequest').create({...})  ->  POST /api/support/requests
 */
import api, { unwrap, normalizeUser } from './index.js';

const arr = (v) => (Array.isArray(v) ? v : []);
const lower = (v, d = undefined) => (v == null ? d : String(v).toLowerCase());

// JSON-text columns <-> arrays (the safety plan stores lists as JSON text)
const parseList = (text) => {
  if (Array.isArray(text)) return text;
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(text).trim() ? [String(text)] : [];
  }
};
const stringifyList = (list) => JSON.stringify(arr(list));

// ---------------------------------------------------------------------------
// Per-entity configuration: REST path + translation functions
// ---------------------------------------------------------------------------
const RESOURCE = {
  path: '/resources',
  listPath: '/resources/manage',          // admin: includes drafts
  fromApi: (r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    content: r.content,
    category: r.category,
    target_audience: r.targetAudience || 'all',
    is_published: r.published !== false,
    priority: r.priority ?? 0,
    tags: arr(r.tags),
    contact_info: r.contactInfo,
    location: r.location,
    created_date: r.createdAt,
    updated_date: r.updatedAt,
  }),
  toApi: (d) => ({
    title: d.title,
    description: d.description,
    content: d.content,
    category: d.category,
    targetAudience: d.target_audience,
    published: d.is_published,
    priority: d.priority,
    tags: arr(d.tags),
    contactInfo: d.contact_info,
    location: d.location,
  }),
};

const SUPPORT_REQUEST = {
  path: '/support/requests',
  fromApi: (r) => ({
    id: r.id,
    subject: r.subject || r.type,
    description: r.description,
    request_type: lower(r.type, 'general'),
    urgency: lower(r.urgency, 'medium'),
    status: lower(r.status, 'pending'),
    assigned_to: r.assignedSupporter || null,
    requester_email: r.user?.email,
    requester_name: r.user?.name,
    is_anonymous: !!r.anonymous,
    notes: r.notes,
    created_date: r.createdAt,
    updated_date: r.updatedAt,
  }),
  toApi: (d) => ({
    subject: d.subject,
    description: d.description,
    requestType: d.request_type,
    urgency: d.urgency,
    anonymous: !!d.is_anonymous,
  }),
  // PATCH body for updates (status / assignment / notes)
  toUpdate: (d) => {
    const body = {};
    if (d.status !== undefined) body.status = d.status;
    if (d.assigned_to !== undefined) body.assignedTo = d.assigned_to || '';
    if (d.notes !== undefined) body.notes = d.notes;
    return body;
  },
};

const SUPPORT_MESSAGE = {
  fromApi: (m, requestId) => ({
    id: m.id,
    request_id: String(requestId ?? m.supportRequest?.id ?? ''),
    sender_email: m.senderEmail,
    sender_role: lower(m.senderRole, m.fromSupporter ? 'counsellor' : 'victim'),
    content: m.content,
    is_internal: !!m.internal,
    created_date: m.createdAt,
  }),
};

const SAFETY_PLAN = {
  path: '/safety-plans',
  fromApi: (p) => ({
    id: p.id,
    title: p.title,
    safe_places: parseList(p.safePlaces),
    emergency_contacts: parseList(p.emergencyContacts),
    important_documents: parseList(p.importantDocuments),
    safety_steps: parseList(p.safetySteps),
    support_services: parseList(p.supportServices),
    personal_notes: p.personalNotes || '',
    created_date: p.createdAt,
    updated_date: p.updatedAt,
  }),
  toApi: (d) => ({
    title: d.title || 'My Safety Plan',
    safePlaces: stringifyList(d.safe_places),
    emergencyContacts: stringifyList(d.emergency_contacts),
    importantDocuments: stringifyList(d.important_documents),
    safetySteps: stringifyList(d.safety_steps),
    supportServices: stringifyList(d.support_services),
    personalNotes: d.personal_notes || '',
  }),
};

const USER = {
  path: '/admin/users',
  fromApi: normalizeUser,
};

const CONFIG = {
  Resource: RESOURCE,
  SupportRequest: SUPPORT_REQUEST,
  SafetyPlan: SAFETY_PLAN,
  User: USER,
};

const cfg = (entity) => {
  const c = CONFIG[entity];
  if (!c) throw new Error(`Unknown entity: ${entity}`);
  return c;
};

// ---------------------------------------------------------------------------
// Helpers: sort / filter / limit done client-side (data sets are small)
// ---------------------------------------------------------------------------
const applySort = (list, sort) => {
  if (!sort) return list;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return [...list].sort((a, b) => {
    const x = a[field];
    const y = b[field];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    const cmp = x > y ? 1 : x < y ? -1 : 0;
    return desc ? -cmp : cmp;
  });
};

// Keys the backend already scopes for us (a victim only ever receives their own plans)
const SERVER_SCOPED = { SafetyPlan: ['owner_email'] };

const applyFilter = (entity, list, filter = {}) => {
  const ignore = SERVER_SCOPED[entity] || [];
  return list.filter((item) =>
    Object.entries(filter).every(([key, value]) => {
      if (value === undefined || ignore.includes(key)) return true;
      if (key === 'id') return String(item.id) === String(value);
      return item[key] === value;
    })
  );
};

const applyLimit = (list, limit) => (limit ? list.slice(0, limit) : list);

// ---------------------------------------------------------------------------
// Public API (same shape the pages already use)
// ---------------------------------------------------------------------------
const fetchList = async (entity, { admin = false } = {}) => {
  const c = cfg(entity);
  const path = admin && c.listPath ? c.listPath : c.path;
  const data = unwrap(await api.get(path));
  return arr(data).map((x) => c.fromApi(x));
};

const fetchMessages = async (requestId) => {
  const data = unwrap(await api.get(`/support/requests/${requestId}/messages`));
  return arr(data).map((m) => SUPPORT_MESSAGE.fromApi(m, requestId));
};

export const entitiesApi = {
  list: async (entity, sort = '-created_date', limit) => {
    if (entity === 'SupportMessage') return [];
    const list = await fetchList(entity, { admin: true });
    return applyLimit(applySort(list, sort), limit);
  },

  filter: async (entity, filter = {}, sort = '-created_date', limit) => {
    if (entity === 'SupportMessage') {
      if (!filter.request_id) return [];
      const { request_id, ...rest } = filter;
      const msgs = await fetchMessages(request_id);
      return applyLimit(applySort(applyFilter(entity, msgs, rest), 'created_date'), limit);
    }

    // Single record by id
    if (filter.id !== undefined && Object.keys(filter).length === 1) {
      const rec = await entitiesApi.get(entity, filter.id);
      return rec ? [rec] : [];
    }

    // Public resources never need the admin list
    const list = await fetchList(entity, { admin: false });
    return applyLimit(applySort(applyFilter(entity, list, filter), sort), limit);
  },

  get: async (entity, id) => {
    const c = cfg(entity);
    try {
      const data = unwrap(await api.get(`${c.path}/${id}`));
      return data ? c.fromApi(data) : null;
    } catch (e) {
      if (e.response?.status === 404 || e.response?.status === 403) return null;
      throw e;
    }
  },

  create: async (entity, data) => {
    if (entity === 'SupportMessage') {
      const res = await api.post(`/support/requests/${data.request_id}/messages`, {
        content: data.content,
        internal: !!data.is_internal,
      });
      return SUPPORT_MESSAGE.fromApi(unwrap(res), data.request_id);
    }
    const c = cfg(entity);
    if (!c.toApi) throw new Error(`${entity} cannot be created from the app`);
    return c.fromApi(unwrap(await api.post(c.path, c.toApi(data))));
  },

  update: async (entity, id, data) => {
    const c = cfg(entity);
    if (entity === 'SupportRequest') {
      return c.fromApi(unwrap(await api.patch(`${c.path}/${id}`, c.toUpdate(data))));
    }
    if (!c.toApi) throw new Error(`${entity} cannot be updated from the app`);
    return c.fromApi(unwrap(await api.put(`${c.path}/${id}`, c.toApi(data))));
  },

  delete: async (entity, id) => {
    const c = cfg(entity);
    await api.delete(`${c.path}/${id}`);
  },
};

// One small API object per entity: createEntityApi('Resource').list(...)
export const createEntityApi = (entity) => ({
  list: (sort, limit) => entitiesApi.list(entity, sort, limit),
  filter: (filter, sort, limit) => entitiesApi.filter(entity, filter, sort, limit),
  get: (id) => entitiesApi.get(entity, id),
  create: (data) => entitiesApi.create(entity, data),
  update: (id, data) => entitiesApi.update(entity, id, data),
  delete: (id) => entitiesApi.delete(entity, id),
});

export { usersAPI } from './index.js';
export default entitiesApi;

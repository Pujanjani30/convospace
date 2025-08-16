export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = "/api/auth";

export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO_ROUTE = `${AUTH_ROUTES}/user-info`;
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_PIC_ROUTE = `${AUTH_ROUTES}/add-profile-pic`;
export const REMOVE_PROFILE_PIC_ROUTE = `${AUTH_ROUTES}/remove-profile-pic`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;

export const CONTACT_ROUTES = "/api/contacts";

export const SEARCH_CONTACTS_ROUTE = `${CONTACT_ROUTES}/search`;
export const GET_DM_CONTACTS_ROUTE = `${CONTACT_ROUTES}/get-dm-contacts`;

export const MESSAGE_ROUTES = "/api/messages";

export const GET_MESSAGES_ROUTE = `${MESSAGE_ROUTES}/get-messages`;
export const UPDATE_UNSEEN_MESSAGES_ROUTE = `${MESSAGE_ROUTES}/update-unseen-messages`;
export const UPLOAD_MESSAGE_FILE_ROUTE = `${MESSAGE_ROUTES}/upload-message-file`;

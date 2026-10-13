import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { handleGrove } from '../../../server/grove';
export const dynamic='force-dynamic';
async function route(request:Request){return handleGrove(request,await getChatGPTUser(),env.DB!)}
export const GET=route;
export const POST=route;

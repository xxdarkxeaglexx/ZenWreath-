import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { handleRooms } from '../../../server/rooms';
export const dynamic='force-dynamic';
async function route(request:Request){return handleRooms(request,await getChatGPTUser(),env.DB!)}
export const GET=route;export const POST=route;

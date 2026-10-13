import {requireChatGPTUser} from '../chatgpt-auth';
import Dashboard from './view';
export const dynamic='force-dynamic';
export default async function Page(){const user=await requireChatGPTUser('/beta-dashboard');if(user.email.toLowerCase()!=='xxdarkxeaglexx@gmail.com')return <p>This beta dashboard is private to the game owner.</p>;return <Dashboard/>}

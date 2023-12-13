// Initialize the JS client
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const { env } = process;

const clientServiceRole = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE);

export default {
    clientServiceRole,
};


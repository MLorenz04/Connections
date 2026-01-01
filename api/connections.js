// api/connection.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ID generátor
function generateId() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < 20; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

// Vercel API handler
export default async function handler(req, res) {
    const method = req.method;

    // GET endpointy
    if (method === "GET") {
        const { id, type } = req.query;

        // GET /api/connection?type=daily
        if (type === "daily") {
            // vybere dnešní záznam z daily_connection tabulky
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

            const { data: dailyData } = await supabase
                .from("daily_connection")
                .select("connection_id")
                .eq("date", today)
                .single();

            let connectionId = dailyData?.connection_id;

            // pokud pro dnešek není, vybere náhodně
            if (!connectionId) {
                const { data: allConnections } = await supabase
                    .from("connections")
                    .select("id");

                if (!allConnections || allConnections.length === 0)
                    return res.status(404).send("Žádné soubory nenalezeny");

                connectionId = allConnections[Math.floor(Math.random() * allConnections.length)].id;

                // uloží do daily_connection
                await supabase
                    .from("daily_connection")
                    .insert({ date: today, connection_id: connectionId });
            }

            const { data: connection } = await supabase
                .from("connections")
                .select("*")
                .eq("id", connectionId)
                .single();

            return res.status(200).json(connection);
        }

        // GET /api/connection?type=random
        if (type === "random") {
            const { data: allConnections } = await supabase
                .from("connections")
                .select("*");

            if (!allConnections || allConnections.length === 0)
                return res.status(404).send("Žádné soubory nenalezeny");

            const random = allConnections[Math.floor(Math.random() * allConnections.length)];
            return res.status(200).json(random);
        }

        // GET /api/connection?id=...
        if (id) {
            const { data: connection } = await supabase
                .from("connections")
                .select("*")
                .eq("id", id)
                .single();

            if (!connection) return res.status(404).send("Hádanka nenalezena :(");

            return res.status(200).json(connection);
        }

        return res.status(400).send("Špatný request");
    }

    // POST endpoint: vytvoření nové connection
    if (method === "POST") {
        const { groups, settings } = req.body;

        if (!settings?.username?.length)
            return res.status(400).send("Je potřeba vyplnit jméno či přezdívku");

        for (const group of groups) {
            if (!group.explanation?.length)
                return res.status(400).send("Doplňte prosím všechna vysvětlení");
            if (group.items.some((item) => !item.length))
                return res.status(400).send("Doplňte prosím všechna slova");
        }

        let id = generateId();
        // zajistí unikátní id
        while (
            (await supabase.from("connections").select("id").eq("id", id)).data?.length
        ) {
            id = generateId();
        }

        const finalObject = {
            id,
            creator: settings.username,
            created_at: new Date(),
            groups,
            settings: {
                color: settings.color,
            },
        };

        const { error } = await supabase.from("connections").insert(finalObject);

        if (error) return res.status(500).json(error);

        return res.status(200).send(id);
    }

    // pokud žádný povolený method
    res.status(405).send("Method not allowed");
}
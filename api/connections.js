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
        const { id } = req.query;

        // helper: načte connection + 4 groups
        async function fetchConnectionWithGroups(connectionId) {
            // fetch connection
            const { data: connection, error: connError } = await supabase
                .from("connection")
                .select("*")
                .eq("id", connectionId)
                .single();

            if (connError || !connection) return null;

            console.log(connectionId);

            // fetch groups pro tuto connection, seřazeno podle position
            const { data: groups, error: groupsError } = await supabase
                .from("groups")
                .select("explanation, items")
                .eq("connection_id", connectionId)
                .order("difficulty", { ascending: true });

            if (groupsError || !groups) return null;

            // spojíme do jednoho objektu, kompatibilní s frontendem
            return {
                id: connection.id,
                creator: connection.creator,
                date: connection.date,
                settings: { color: connection.color },
                groups: groups.map(g => ({ explanation: g.explanation, items: g.items }))
            };
        }

        // GET /api/connection?type=daily
        if (id === "daily") {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");
            const localDate = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD pro Postgres

            // zkus najít dnešní daily connection
            let { data: dailyData } = await supabase
                .from("daily_connection")
                .select("connection_id")
                .eq("date", localDate)
                .single();

            let connectionId = dailyData?.connection_id;

            // pokud ještě není, vyber náhodnou connection
            if (!connectionId) {
                const { data: allConnections } = await supabase
                    .from("connection")
                    .select("id");

                if (!allConnections || allConnections.length === 0)
                    return res.status(404).send("Žádné connection nenalezeny");

                connectionId = allConnections[Math.floor(Math.random() * allConnections.length)].id;

                // vložíme do daily_connection
                await supabase
                    .from("daily_connection")
                    .insert({ date: localDate, connection_id: connectionId });
            }

            // fetch connection + groups
            const connectionData = await fetchConnectionWithGroups(connectionId);

            console.log(connectionData);
            if (!connectionData) return res.status(404).send("Connection nenalezena");

            return res.status(200).json(connectionData);
        }

        // GET /api/connection?type=random
        if (id === "random") {
            const { data: allConnections } = await supabase.from("connection").select("id");

            if (!allConnections || allConnections.length === 0)
                return res.status(404).send("Žádné connection nenalezeny");

            const randomId = allConnections[Math.floor(Math.random() * allConnections.length)].id;
            const connectionData = await fetchConnectionWithGroups(randomId);
            if (!connectionData) return res.status(404).send("Connection nenalezena");

            return res.status(200).json(connectionData);
        }

        // GET /api/connection?id=...
        if (id) {
            const connectionData = await fetchConnectionWithGroups(id);
            if (!connectionData) return res.status(404).send("Connection nenalezena");
            return res.status(200).json(connectionData);
        }

        return res.status(400).send("Špatný request");
    }


    // POST endpoint: vytvoření nové connection
    if (method === "POST") {
        const { groups, settings } = req.body;

        // validace
        if (!settings?.username?.length)
            return res.status(400).send("Je potřeba vyplnit jméno či přezdívku");

        if (!Array.isArray(groups) || groups.length !== 4)
            return res.status(400).send("Musí být přesně 4 groupy");

        for (const group of groups) {
            if (!group.explanation?.length)
                return res.status(400).send("Doplňte prosím všechna vysvětlení");
            if (!Array.isArray(group.items) || group.items.some((item) => !item.length))
                return res.status(400).send("Doplňte prosím všechna slova");
        }

        // generování unikátního ID connection
        let id = generateId();
        while ((await supabase.from("connection").select("id").eq("id", id)).data?.length) {
            id = generateId();
        }

        // vložení do connections
        const { error: connError } = await supabase.from("connection").insert({
            id,
            creator: settings.username,
            date: new Date(),
            color: settings?.color || null
        });

        if (connError) return res.status(500).json(connError);

        // vložení 4 groups
        const groupInserts = groups.map((group, index) => ({
            connection_id: id,
            difficulty: index + 1, // 1–4
            explanation: group.explanation,
            items: group.items,
        }));

        const { error: groupsError } = await supabase.from("groups").insert(groupInserts);

        if (groupsError) return res.status(500).json(groupsError);

        return res.status(200).send(id);

    }

    // pokud žádný povolený method
    res.status(405).send("Method not allowed");
}
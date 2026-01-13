import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Serve images from Convex storage
http.route({
    path: "/getImage",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const storageId = url.searchParams.get("storageId");

        if (!storageId) {
            return new Response("Missing storageId", { status: 400 });
        }

        try {
            const fileUrl = await ctx.storage.getUrl(storageId as any);

            if (!fileUrl) {
                return new Response("File not found", { status: 404 });
            }

            // Redirect to the actual storage URL
            return Response.redirect(fileUrl, 302);
        } catch (error) {
            console.error("Error getting file:", error);
            return new Response("Error getting file", { status: 500 });
        }
    }),
});

export default http;

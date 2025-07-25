import { Anthropic } from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
dotenv.config();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
}
class MCPClient {
    mcp;
    anthropic;
    transport = null;
    tools = [];
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
        });
        this.mcp = new Client({ name: "aladin-mcpserver", version: "1.0.0" });
    }
    // methods will go here
    async connectToServer(serverScriptPath) {
        try {
            this.transport = new StdioClientTransport({
                command: process.execPath,
                args: [serverScriptPath],
            });
            await this.mcp.connect(this.transport);
            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema,
                };
            });
            console.log("Connected to server with tools:", this.tools.map(({ name }) => name));
        }
        catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }
    async processQuery(query) {
        const messages = [
            {
                role: "user",
                content: query,
            },
        ];
        const response = await this.anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages,
            tools: this.tools,
        });
        const finalText = [];
        for (const content of response.content) {
            if (content.type === "text") {
                finalText.push(content.text);
            }
            else if (content.type === "tool_use") {
                const toolName = content.name;
                const toolArgs = content.input;
                const result = await this.mcp.callTool({
                    name: toolName,
                    arguments: toolArgs,
                });
                finalText.push(`[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`);
                messages.push({
                    role: "user",
                    content: result.content,
                });
                const response = await this.anthropic.messages.create({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 1000,
                    messages,
                });
                finalText.push(response.content[0].type === "text" ? response.content[0].text : "");
            }
        }
        return finalText.join("\n");
    }
}
const express = require('express');
const app = express();
const PORT = process.env.SERVER_PORT;
app.get('/', (req, res) => {
    res.send('Hello, world! This is a response from your Express server.');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
async function main() {
    const mcpClient = new MCPClient();
    try {
        await mcpClient.connectToServer('/Users/kakaogames/Projects/mcp_study/aladin-mcpserver/dist/index.js');
        const response = await mcpClient.processQuery('베스트셀러 추천해줘');
        console.log("\n" + response);
    }
    finally {
        process.exit(0);
    }
}
main();

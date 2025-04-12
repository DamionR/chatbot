import os

# List of file paths
file_paths = [
    "/Users/damionrashford/chatbot-project/package.json",
    "/Users/damionrashford/chatbot-project/.env",
    "/Users/damionrashford/chatbot-project/utils/utils.js",
    "/Users/damionrashford/chatbot-project/mcp/whois.js",
    "/Users/damionrashford/chatbot-project/mcp/websearch.js",
    "/Users/damionrashford/chatbot-project/mcp/tavily.js",
    "/Users/damionrashford/chatbot-project/mcp/sequentialthinking.js",
    "/Users/damionrashford/chatbot-project/mcp/github.js",
    "/Users/damionrashford/chatbot-project/mcp/googlenews.js",
    "/Users/damionrashford/chatbot-project/mcp/filesystem.js",
    "/Users/damionrashford/chatbot-project/mcp/fetchapi.js",
    "/Users/damionrashford/chatbot-project/mcp/email.js",
    "/Users/damionrashford/chatbot-project/mcp/chatstore.js",
    "/Users/damionrashford/chatbot-project/frontend/ui.js",
    "/Users/damionrashford/chatbot-project/frontend/main.js",
    "/Users/damionrashford/chatbot-project/frontend/index.html",
    "/Users/damionrashford/chatbot-project/config/settings.js",
    "/Users/damionrashford/chatbot-project/backend/db.js",
    "/Users/damionrashford/chatbot-project/backend/api.js",
    "/Users/damionrashford/chatbot-project/agents/evaluator.js",
    "/Users/damionrashford/chatbot-project/agents/executor.js",
    "/Users/damionrashford/chatbot-project/agents/orchestrator.js"
]

# Output file path
output_file = "/Users/damionrashford/chatbot-project/file_contents.txt"

def write_file_contents():
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for file_path in file_paths:
            # Skip if file doesn't exist
            if not os.path.exists(file_path):
                outfile.write(f"\n=== {file_path} (NOT FOUND) ===\n")
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as infile:
                    # Write header with file path
                    outfile.write(f"\n=== {file_path} ===\n")
                    # Write file contents
                    outfile.write(infile.read())
                    outfile.write("\n")  # Add newline between files
            except Exception as e:
                outfile.write(f"\n=== {file_path} (ERROR: {str(e)}) ===\n")

if __name__ == "__main__":
    write_file_contents()
    print(f"File contents have been written to {output_file}")
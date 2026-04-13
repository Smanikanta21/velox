'use client';

import React, { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const LANGUAGE_TEMPLATES: Record<string, string> = {
    python: `import sys\n\ndef main():\n    # Read all lines from standard input\n    input_data = sys.stdin.read().splitlines()\n    if not input_data:\n        return\n    \n    # Example: Print back the first line\n    print(input_data[0])\n\nif __name__ == '__main__':\n    main()`,
    javascript: `const fs = require('fs');\n\nfunction main() {\n    // Read all input from standard input\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\n    if (input.length === 0 || input[0] === '') return;\n\n    // Example: Print back the first line\n    console.log(input[0]);\n}\n\nmain();`,
    go: `package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\tscanner := bufio.NewScanner(os.Stdin)\n\t// Example: Read first line and print it back\n\tif scanner.Scan() {\n\t\tfmt.Println(scanner.Text())\n\t}\n}`,
    cpp: `#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    string line;\n    // Example: Read first line and print it back\n    if (getline(cin, line)) {\n        cout << line << endl;\n    }\n    return 0;\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    char line[1024];\n    // Example: Read first line and print it back\n    if (fgets(line, sizeof(line), stdin)) {\n        printf("%s", line);\n    }\n    return 0;\n}`,
    java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Example: Read first line and print it back\n        if (scanner.hasNextLine()) {\n            System.out.println(scanner.nextLine());\n        }\n        scanner.close();\n    }\n}`
};

export default function PlaygroundPage() {
    const [apiKey, setApiKey] = useState('');
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
    const [testCases, setTestCases] = useState([{ id: 1, input: '', expectedOutput: '' }]);
    const [timeLimit, setTimeLimit] = useState(2000);
    const [memoryLimit, setMemoryLimit] = useState(256000);

    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [statusLog, setStatusLog] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const appendLog = (type: 'info' | 'success' | 'error', message: string, data?: any) => {
        setStatusLog(prev => [...prev, { type, message, data, timestamp: new Date() }]);
    };

    const handleSubmit = async () => {
        if (!apiKey) {
            appendLog('error', 'API Key is required');
            return;
        }

        setIsSubmitting(true);
        appendLog('info', 'Submitting code...');

        try {
            const res = await fetch(`${API_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    language,
                    source_code: code,
                    test_cases: testCases.map(tc => ({
                        test_case_id: tc.id,
                        input: tc.input,
                        expected_output: tc.expectedOutput
                    })),
                    time_limit_ms: timeLimit,
                    memory_limit_kb: memoryLimit,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                appendLog('error', `Submit failed: ${res.status || res.statusText}`, data);
                setIsSubmitting(false);
                return;
            }

            if (data?.submission_id) {
                setSubmissionId(data.submission_id);
            }
            appendLog('success', 'Submission accepted!', data);
        } catch (err: any) {
            appendLog('error', `Error submitting code: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!apiKey) {
            appendLog('error', 'API Key is required to check status');
            return;
        }
        if (!submissionId) {
            appendLog('error', 'No submission ID available');
            return;
        }

        setIsChecking(true);
        appendLog('info', `Checking status for ${submissionId}...`);

        try {
            const res = await fetch(`${API_URL}/status?submission_id=${submissionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                appendLog('error', `Check status failed: ${res.status || res.statusText}`, data);
                setIsChecking(false);
                return;
            }

            appendLog('success', `Status retrieved (${data?.status || data?.overall_state || 'unknown'})`, data);
        } catch (err: any) {
            appendLog('error', `Error checking status: ${err.message}`);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
            <div className="flex flex-col mb-4">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    API Playground
                </h1>
                <p className="text-foreground/50 text-sm mt-2">
                    Test your API keys directly from the dashboard. Submit code execution requests and track their status.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Request Configuration Form */}
                <div className="flex flex-col gap-6">
                    <div className="dev-card p-6 bg-surface/40 border border-white/5 rounded-xl">
                        <h2 className="text-lg font-bold text-white mb-4">Request Setup <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">POST /submit</span></h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-1">API Key Integration</label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your vlx_ token..."
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors font-mono text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-1">Runtime</label>
                                    <select
                                        value={language}
                                        onChange={(e) => {
                                            const newLang = e.target.value;
                                            setLanguage(newLang);
                                            setCode(LANGUAGE_TEMPLATES[newLang] || '');
                                        }}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="python">Python 3.10</option>
                                        <option value="javascript">Node.js</option>
                                        <option value="go">Go 1.21</option>
                                        <option value="cpp">C++ (GCC)</option>
                                        <option value="c">C (GCC)</option>
                                        <option value="java">Java 21</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-white/70 mb-1">Time (ms)</label>
                                        <input
                                            type="number"
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-white/70 mb-1">RAM (KB)</label>
                                        <input
                                            type="number"
                                            value={memoryLimit}
                                            onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-1">Payload Code</label>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    rows={8}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors font-mono text-sm resize-y shadow-inner"
                                ></textarea>
                            </div>

                            <div className="pt-2 border-t border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-white/70">Test Cases</label>
                                    <button
                                        onClick={() => setTestCases([...testCases, { id: testCases.length ? Math.max(...testCases.map(t => t.id)) + 1 : 1, input: '', expectedOutput: '' }])}
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors border border-white/10 hover:border-white/20"
                                    >
                                        + Add Case
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {testCases.map((tc, idx) => (
                                        <div key={tc.id} className="p-3 bg-black/30 border border-white/5 rounded-lg flex flex-col gap-2 relative">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-white/50">Case #{tc.id}</span>
                                                <button
                                                    onClick={() => setTestCases(testCases.filter(t => t.id !== tc.id))}
                                                    className="text-red-400 hover:text-red-300 text-xs font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-white/40 uppercase mb-1 block font-bold tracking-wider">Input</label>
                                                    <textarea 
                                                        value={tc.input} 
                                                        onChange={(e) => {
                                                            const newCases = [...testCases];
                                                            newCases[idx].input = e.target.value;
                                                            setTestCases(newCases);
                                                        }}
                                                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs font-mono resize-y focus:outline-none focus:border-primary/50 transition-colors" 
                                                        rows={2}
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-white/40 uppercase mb-1 block font-bold tracking-wider">Expected Output</label>
                                                    <textarea 
                                                        value={tc.expectedOutput} 
                                                        onChange={(e) => {
                                                            const newCases = [...testCases];
                                                            newCases[idx].expectedOutput = e.target.value;
                                                            setTestCases(newCases);
                                                        }}
                                                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs font-mono resize-y focus:outline-none focus:border-primary/50 transition-colors" 
                                                        rows={2}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {testCases.length === 0 && (
                                        <div className="text-xs text-white/40 text-center py-4 bg-black/20 rounded border border-dashed border-white/10">No test cases added.</div>
                                    )}
                                </div>
                            </div>


                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(255,90,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                )}
                                Submit Execution
                            </button>
                        </div>
                    </div>
                </div>

                {/* Response / Logs Column */}
                <div className="flex flex-col gap-6 h-full">
                    <div className="dev-card p-6 bg-surface/40 border border-white/5 rounded-xl flex-1 flex flex-col min-h-[550px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Execution Trace
                                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">GET /status</span>
                            </h2>
                            {submissionId && (
                                <button
                                    onClick={handleCheckStatus}
                                    disabled={isChecking}
                                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isChecking ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )}
                                    Poll Status
                                </button>
                            )}
                        </div>

                        {submissionId && (
                            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between shadow-sm">
                                <span className="text-xs text-primary font-bold uppercase tracking-wider">Active Submission ID</span>
                                <span className="font-mono text-xs text-primary/90 bg-black/40 px-2 py-1 rounded select-all cursor-text">{submissionId}</span>
                            </div>
                        )}

                        <div className="flex-1 bg-black/80 rounded-lg border border-white/5 p-4 overflow-y-auto font-mono text-xs flex flex-col shadow-inner relative max-h-[400px]">
                            {statusLog.length === 0 ? (
                                <div className="text-white/30 h-full flex flex-col items-center justify-center italic opacity-70">
                                    <svg className="w-10 h-10 mb-2 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Waiting for execution payload...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {statusLog.map((log, i) => (
                                        <div key={i} className="flex flex-col gap-1.5 border-b border-white/5 pb-3 last:border-0 relative pl-4">
                                            <div className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full" style={{
                                                backgroundColor: log.type === 'error' ? '#f87171' : log.type === 'success' ? '#4ade80' : '#60a5fa'
                                            }}></div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/40 text-[10px]">[{log.timestamp.toLocaleTimeString()}]</span>
                                                <span className={`font-bold ${
                                                    log.type === 'error' ? 'text-red-400' :
                                                    log.type === 'success' ? 'text-green-400' :
                                                    'text-blue-400'
                                                }`}>
                                                    {log.type.toUpperCase()}
                                                </span>
                                                <span className="text-white/80">{log.message}</span>
                                            </div>
                                            {log.data && (
                                                <pre className="bg-white/5 p-3 rounded-md text-white/70 overflow-x-auto shadow-sm border border-white/5">
                                                    {JSON.stringify(log.data, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {statusLog.length > 0 && (
                            <button
                                onClick={() => { setStatusLog([]); setSubmissionId(null); }}
                                className="mt-4 text-[10px] uppercase font-bold tracking-wider text-white/30 hover:text-white/60 transition-colors w-fit self-end"
                            >
                                Clear Logs
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

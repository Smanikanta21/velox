export interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
}

export interface ExecutionPayload {
    language: string;
    source_code: string;
    test_cases: {
        test_case_id: number;
        input: string;
        expected_output: string;
    }[];
    time_limit_ms: number;
    memory_limit_kb: number;
}

export interface ExecutionResult {
    submission_id: string;
    overall_state: string;
    results: any[] | null;
}

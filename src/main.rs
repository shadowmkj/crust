use bollard::{API_DEFAULT_VERSION, Docker};
use clap::Parser;
use crust::models::{Language, TestCase};
use crust::runner;

/// Crust — Code Runner UST
/// a sandboxed code runner and test case judger.
///
/// Executes user-submitted solutions inside Docker containers,
/// pipes test case inputs via stdin, and judges the output.
#[derive(Parser, Debug)]
#[command(version, about)]
struct Cli {
    /// Submission language.
    #[arg(value_enum)]
    language: Language,

    /// The method/function name to invoke on the Solution class.
    #[arg(default_value = "twoSum")]
    method_name: String,

    /// Path to the JSON file containing test cases.
    #[arg(short, long, default_value = "two_sum.jsonl")]
    tests: String,

    /// Docker socket path.
    #[arg(long, default_value = "unix:///Users/milan/.docker/run/docker.sock")]
    docker_socket: String,
}

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    let cli = Cli::parse();

    let docker = Docker::connect_with_unix(&cli.docker_socket, 120, API_DEFAULT_VERSION)?;
    println!("Successfully connected to Docker daemon.");

    // Read test cases from JSON file
    let tests_path = std::path::Path::new("code_tests");
    let tests_file = tests_path.join(&cli.tests);
    let test_cases: Vec<TestCase> = serde_json::from_reader(std::fs::File::open(tests_file)?)?;

    // Run the execution pipeline
    for test_case in test_cases {
        println!("Executing Test Case ID: {}", test_case.id);
        match runner::execute_submission(&docker, test_case, &cli.language, &cli.method_name, None)
            .await
        {
            Ok(verdict) => println!("{}", verdict),
            Err(e) => eprintln!("Error executing test case: {}", e),
        }
    }

    Ok(())
}

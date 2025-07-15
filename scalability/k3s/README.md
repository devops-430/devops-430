# CPU Utilization Generator

This project contains C programs that generate specific CPU utilization percentages for testing and benchmarking purposes.

## Programs

### 1. `cpu_50_percent.c`
A simple program that generates exactly 50% CPU utilization by alternating between CPU-intensive work and sleep periods.

### 2. `cpu_utilization.c`
An advanced program that allows you to specify any CPU utilization percentage (1-99%).

## How It Works

Both programs work by:
1. Performing CPU-intensive calculations (squaring numbers in a loop)
2. Sleeping for a calculated duration
3. Repeating this cycle to achieve the desired CPU utilization

The formula used is:
```
sleep_time = work_time × (100 - desired_cpu_percent) / desired_cpu_percent
```

## Building

```bash
# Build both programs
make

# Build only the 50% program
make cpu_50_percent

# Build only the adjustable program
make cpu_utilization
```

## Usage

### Simple 50% CPU Utilization
```bash
# Build and run
make run-50

# Or run directly
./cpu_50_percent
```

### Adjustable CPU Utilization
```bash
# Build and run with default 50%
make run-util

# Run with specific percentages
./cpu_utilization 25    # 25% CPU utilization
./cpu_utilization 75    # 75% CPU utilization
./cpu_utilization 10    # 10% CPU utilization

# Show help
./cpu_utilization --help
```

## Monitoring CPU Usage

You can monitor the actual CPU usage using:

```bash
# Using top (press 'q' to quit)
top

# Using htop (if installed)
htop

# Using ps
ps aux | grep cpu_50_percent

# Using system monitor tools
# - Activity Monitor (macOS)
# - Task Manager (Windows)
# - System Monitor (Linux)
```

## Stopping the Programs

Press `Ctrl+C` to stop either program.

## Cleaning Up

```bash
make clean
```

## Notes

- The programs use `volatile` variables and dummy operations to prevent compiler optimization
- The work cycle is set to 100ms by default, which provides good granularity
- CPU utilization may vary slightly due to system scheduling and other processes
- These programs are intended for testing and benchmarking purposes

## Requirements

- GCC compiler
- Unix-like system (Linux, macOS, BSD)
- Standard C libraries

## License

This code is provided as-is for educational and testing purposes.

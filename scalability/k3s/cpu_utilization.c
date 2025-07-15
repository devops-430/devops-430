#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include <sys/time.h>
#include <string.h>

// Function to perform CPU-intensive work
void cpu_intensive_work() {
    volatile unsigned long long result = 0;
    // Perform calculations to consume CPU
    for (int i = 0; i < 1000000; i++) {
        result += i * i;
        result = result % 1000000007; // Prevent overflow
    }
    // Prevent compiler optimization
    if (result == 0) {
        printf(""); // This will never execute, but prevents optimization
    }
}

// Function to sleep for a specified duration
void sleep_duration(int microseconds) {
    usleep(microseconds);
}

// Function to calculate sleep time based on desired CPU utilization
int calculate_sleep_time(int cpu_percent, int work_time_us) {
    if (cpu_percent <= 0 || cpu_percent >= 100) {
        return 0;
    }
    // Formula: sleep_time = work_time * (100 - cpu_percent) / cpu_percent
    return (work_time_us * (100 - cpu_percent)) / cpu_percent;
}

void print_usage(const char *program_name) {
    printf("Usage: %s [CPU_PERCENTAGE]\n", program_name);
    printf("  CPU_PERCENTAGE: Desired CPU utilization (1-99)\n");
    printf("  Default: 50%%\n");
    printf("Examples:\n");
    printf("  %s        # 50%% CPU utilization\n", program_name);
    printf("  %s 25     # 25%% CPU utilization\n", program_name);
    printf("  %s 75     # 75%% CPU utilization\n", program_name);
}

int main(int argc, char *argv[]) {
    int cpu_percent = 50; // Default to 50%
    
    // Parse command line arguments
    if (argc > 1) {
        if (strcmp(argv[1], "-h") == 0 || strcmp(argv[1], "--help") == 0) {
            print_usage(argv[0]);
            return 0;
        }
        
        cpu_percent = atoi(argv[1]);
        if (cpu_percent <= 0 || cpu_percent >= 100) {
            fprintf(stderr, "Error: CPU percentage must be between 1 and 99\n");
            print_usage(argv[0]);
            return 1;
        }
    }
    
    printf("Starting CPU %d%% utilization program...\n", cpu_percent);
    printf("Press Ctrl+C to stop\n");
    
    // Set up timing
    struct timeval start_time, current_time;
    gettimeofday(&start_time, NULL);
    
    // Calculate work and sleep times
    int work_time_us = 100000; // 100ms of work
    int sleep_time_us = calculate_sleep_time(cpu_percent, work_time_us);
    
    printf("Work time: %d ms, Sleep time: %d ms\n", 
           work_time_us / 1000, sleep_time_us / 1000);
    
    while (1) {
        // CPU-intensive work phase
        cpu_intensive_work();
        
        // Sleep phase
        if (sleep_time_us > 0) {
            sleep_duration(sleep_time_us);
        }
        
        // Optional: Print status every 10 seconds
        gettimeofday(&current_time, NULL);
        long elapsed = (current_time.tv_sec - start_time.tv_sec);
        if (elapsed % 10 == 0 && elapsed > 0) {
            printf("Running for %ld seconds...\n", elapsed);
        }
    }
    
    return 0;
} 
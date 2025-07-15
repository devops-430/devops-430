#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include <sys/time.h>

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

int main() {
    printf("Starting CPU 50%% utilization program...\n");
    printf("Press Ctrl+C to stop\n");
    
    // Set up timing
    struct timeval start_time, current_time;
    gettimeofday(&start_time, NULL);
    
    while (1) {
        // CPU-intensive work phase (50% of the time)
        cpu_intensive_work();
        
        // Sleep phase (50% of the time)
        sleep_duration(100000); // Sleep for 100ms
        
        // Optional: Print status every 10 seconds
        gettimeofday(&current_time, NULL);
        long elapsed = (current_time.tv_sec - start_time.tv_sec);
        if (elapsed % 10 == 0) {
            printf("Running for %ld seconds...\n", elapsed);
        }
    }
    
    return 0;
} 
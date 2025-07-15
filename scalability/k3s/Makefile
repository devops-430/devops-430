CC = gcc
CFLAGS = -Wall -Wextra -O2

# Targets
CPU_50 = cpu_50_percent
CPU_UTIL = cpu_utilization

all: $(CPU_50) $(CPU_UTIL)

$(CPU_50): cpu_50_percent.c
	$(CC) $(CFLAGS) -o $(CPU_50) cpu_50_percent.c

$(CPU_UTIL): cpu_utilization.c
	$(CC) $(CFLAGS) -o $(CPU_UTIL) cpu_utilization.c

clean:
	rm -f $(CPU_50) $(CPU_UTIL)

run-50: $(CPU_50)
	./$(CPU_50)

run-util: $(CPU_UTIL)
	./$(CPU_UTIL)

help:
	@echo "Available targets:"
	@echo "  all        - Build both programs"
	@echo "  cpu_50_percent - Build 50%% CPU utilization program"
	@echo "  cpu_utilization - Build adjustable CPU utilization program"
	@echo "  run-50     - Run 50%% CPU utilization program"
	@echo "  run-util   - Run adjustable CPU utilization program"
	@echo "  clean      - Remove compiled programs"
	@echo "  help       - Show this help message"
	@echo ""
	@echo "Usage examples:"
	@echo "  make run-50                    # Run 50%% CPU utilization"
	@echo "  make run-util                  # Run 50%% CPU utilization (default)"
	@echo "  ./cpu_utilization 25           # Run 25%% CPU utilization"
	@echo "  ./cpu_utilization 75           # Run 75%% CPU utilization"

.PHONY: all clean run-50 run-util help 
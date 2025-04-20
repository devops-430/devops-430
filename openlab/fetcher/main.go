package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	"github.com/joho/godotenv"
)

type Machine struct {
	InstanceID  string    `json:"instance_id"`
	Name        string    `json:"name"`
	Status      string    `json:"status"`
	PublicIP    string    `json:"public_ip"`
	PrivateIP   string    `json:"private_ip"`
	UserID      string    `json:"user_id"`
	LastUpdated time.Time `json:"last_updated"`
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	backendURL := os.Getenv("BACKEND_API_URL")
	if backendURL == "" {
		backendURL = "http://localhost:3001"
	}

	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("Unable to load SDK config: %v", err)
	}

	// Create EC2 client
	ec2Client := ec2.NewFromConfig(cfg)

	// Start periodic scanning
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if err := scanAndUpdateMachines(ec2Client, backendURL); err != nil {
				log.Printf("Error scanning machines: %v", err)
			}
		}
	}
}

func scanAndUpdateMachines(ec2Client *ec2.Client, backendURL string) error {
	input := &ec2.DescribeInstancesInput{}
	result, err := ec2Client.DescribeInstances(context.TODO(), input)
	if err != nil {
		return fmt.Errorf("failed to describe instances: %v", err)
	}

	var machines []Machine
	for _, reservation := range result.Reservations {
		for _, instance := range reservation.Instances {
			name := "Unknown"
			userID := "Unknown"

			// Extract tags
			for _, tag := range instance.Tags {
				if *tag.Key == "Name" {
					name = *tag.Value
				}
				if *tag.Key == "UserID" {
					userID = *tag.Value
				}
			}

			machine := Machine{
				InstanceID:  *instance.InstanceId,
				Name:        name,
				Status:      string(instance.State.Name),
				LastUpdated: time.Now(),
				UserID:      userID,
			}

			if instance.PublicIpAddress != nil {
				machine.PublicIP = *instance.PublicIpAddress
			}
			if instance.PrivateIpAddress != nil {
				machine.PrivateIP = *instance.PrivateIpAddress
			}

			machines = append(machines, machine)
		}
	}

	// Update backend with machine information
	for _, machine := range machines {
		if err := updateBackend(machine, backendURL); err != nil {
			log.Printf("Error updating backend for machine %s: %v", machine.InstanceID, err)
		}
	}

	return nil
}

func updateBackend(machine Machine, backendURL string) error {
	jsonData, err := json.Marshal(machine)
	if err != nil {
		return fmt.Errorf("error marshaling machine data: %v", err)
	}

	resp, err := http.Post(backendURL+"/api/machines/update", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error sending data to backend: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("backend returned non-OK status: %d", resp.StatusCode)
	}

	return nil
}

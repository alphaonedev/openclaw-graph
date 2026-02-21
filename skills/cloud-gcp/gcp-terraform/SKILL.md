---
name: gcp-terraform
cluster: cloud-gcp
description: "Automate and manage Google Cloud Platform resources using Terraform for infrastructure as code."
tags: ["gcp","terraform","iac"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp terraform infrastructure as code provisioning automation devops"
---

## gcp-terraform

### Purpose
This skill enables automation of GCP resources using Terraform, allowing declarative infrastructure as code for provisioning, updating, and destroying resources like VMs, networks, and storage.

### When to Use
Use this skill for repeatable infrastructure deployments in GCP, such as setting up development environments, scaling applications, or migrating resources. Apply it when you need version-controlled IaC, multi-environment consistency, or integration with CI/CD pipelines for GCP-specific tasks.

### Key Capabilities
- Provision GCP resources via HCL configurations, e.g., define a VM with `resource "google_compute_instance" "vm" { ... }`.
- Manage state with Terraform backend, such as GCS for remote storage: `terraform { backend "gcs" { bucket = "my-tf-state" } }`.
- Handle dependencies between resources, like linking a VM to a network using `depends_on` in HCL.
- Import existing GCP resources into Terraform state with `terraform import google_compute_instance.vm projects/my-project/zones/us-central1-a/instances/my-vm`.
- Support for GCP-specific modules, e.g., using the official Terraform GCP provider for features like IAM roles or Kubernetes clusters.

### Usage Patterns
To use this skill, first set up your GCP project and authenticate via environment variable: `export GOOGLE_CREDENTIALS=$(cat /path/to/service-account-key.json)`. Then, create a main.tf file with HCL, initialize Terraform, and apply changes.

Pattern 1: Basic resource creation  
Write a configuration in main.tf:  
```hcl
provider "google" {  
  project = "my-gcp-project"  
  region  = "us-central1"  
}  
resource "google_compute_instance" "default" {  
  name         = "test-vm"  
  machine_type = "e2-medium"  
}
```  
Run: `terraform init` followed by `terraform apply -auto-approve`.

Pattern 2: Plan and apply with variables  
Define variables in variables.tf:  
```hcl
variable "instance_name" {  
  type = string  
  default = "dev-vm"  
}  
```  
Execute: `terraform plan -var="instance_name=my-vm"` then `terraform apply -var-file=vars.tfvars`.

### Common Commands/API
- **terraform init**: Initializes the working directory; use with `-backend-config="bucket=my-bucket"` for GCS backend.
- **terraform plan**: Generates an execution plan; add `-out=plan.tfplan` to save it, or `-var="region=us-west1"` for overrides.
- **terraform apply**: Applies the configuration; include `-auto-approve` to skip confirmation, e.g., `terraform apply -var="project_id=my-project"`.
- **terraform destroy**: Removes resources; run as `terraform destroy -target=google_compute_instance.default` to target specific resources.
- API Endpoints: Terraform interacts with GCP APIs via the provider, e.g., Compute Engine API for VMs (POST to `https://compute.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances`). Set API access in credentials.
- Config Formats: Use HCL for .tf files; JSON is supported but less common, e.g., `terraform plan -json` for output.

### Integration Notes
Integrate by setting the `GOOGLE_CREDENTIALS` environment variable for authentication: `export GOOGLE_CREDENTIALS='{"type":"service_account",...}'`. For CI/CD, use Terraform with GitHub Actions or Jenkins: add a step like `run: terraform init && terraform apply`. Link with other tools via modules, e.g., import a GCP module from the Terraform Registry. Ensure the GCP provider version matches in your configuration: `terraform { required_providers { google = { source = "hashicorp/google" version = "~> 4.0" } } }`. For multi-cloud, combine with other providers in the same .tf file.

### Error Handling
Check for authentication errors first: if `Error: google: could not find default credentials`, verify `GOOGLE_CREDENTIALS` env var or run `gcloud auth application-default login`. For configuration issues, use `terraform validate` to catch HCL syntax errors. Handle API failures by wrapping commands in scripts, e.g., `if terraform apply; then echo "Success"; else echo "Failed: check logs"; fi`. Common errors include resource not found (add `depends_on` in HCL) or quota limits; resolve by checking GCP Console quotas. Use `terraform state pull` to inspect and fix state files manually.

### Concrete Usage Examples
Example 1: Provision a GCP storage bucket  
Create a file named main.tf:  
```hcl
resource "google_storage_bucket" "bucket" {  
  name          = "my-terraform-bucket"  
  location      = "US"  
  force_destroy = true  
}  
```  
Run: `export GOOGLE_CREDENTIALS=$(cat key.json) && terraform init && terraform apply -auto-approve`.

Example 2: Set up a GCP VM with a firewall rule  
In main.tf:  
```hcl
resource "google_compute_network" "vpc" {  
  name = "terraform-network"  
}  
resource "google_compute_instance" "vm" {  
  name         = "web-vm"  
  machine_type = "f1-micro"  
  network_interface {  
    network = google_compute_network.vpc.name  
  }  
}  
```  
Execute: `terraform plan && terraform apply` to create the network and VM.

## Graph Relationships
- Related Cluster: cloud-gcp (this skill is part of the cloud-gcp cluster for GCP-related tools).
- Related Tags: gcp, terraform, iac (connects to other skills tagged with "gcp" for broader GCP automation, "terraform" for IaC tools, and "iac" for infrastructure management).
- Outgoing Links: Links to general Terraform skills for core functionality and to other GCP skills like gcp-compute for specific resource types.

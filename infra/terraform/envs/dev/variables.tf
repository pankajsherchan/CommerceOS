variable "aws_region" {
  description = "AWS region for the dev environment."
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
  default     = "commerce-os"
}

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the dev VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "db_name" {
  description = "Initial PostgreSQL database name."
  type        = string
  default     = "commerce_os"
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "commerceos"
}

variable "db_password" {
  description = "PostgreSQL master password."
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class for dev."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated RDS storage in GiB."
  type        = number
  default     = 20
}

variable "storefront_desired_count" {
  description = "Desired storefront ECS task count. Defaults to zero until an image is pushed."
  type        = number
  default     = 0
}

variable "api_desired_count" {
  description = "Desired API ECS task count. Defaults to zero until an image is pushed."
  type        = number
  default     = 0
}

variable "storefront_image_uri" {
  description = "Storefront container image URI. Defaults to the Terraform-created ECR repository latest tag."
  type        = string
  default     = null
}

variable "api_image_uri" {
  description = "Commerce API container image URI. Defaults to the Terraform-created ECR repository latest tag."
  type        = string
  default     = null
}

variable "storefront_environment_variables" {
  description = "Additional plain environment variables for the storefront container."
  type        = map(string)
  default     = {}
}

variable "api_environment_variables" {
  description = "Additional plain environment variables for the API container."
  type        = map(string)
  default     = {}
}

variable "api_listener_paths" {
  description = "ALB path patterns routed to the commerce API."
  type        = list(string)
  default     = ["/health", "/catalog*", "/cart*"]
}

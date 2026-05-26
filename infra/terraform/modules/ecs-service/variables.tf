variable "name" {
  description = "Service name suffix."
  type        = string
}

variable "cluster_arn" {
  description = "ECS cluster ARN."
  type        = string
}

variable "execution_role_arn" {
  description = "ECS task execution role ARN."
  type        = string
}

variable "task_role_arn" {
  description = "ECS task role ARN."
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs where tasks should run."
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security group IDs attached to tasks."
  type        = list(string)
}

variable "target_group_arn" {
  description = "Load balancer target group ARN."
  type        = string
}

variable "container_name" {
  description = "Container name in the task definition."
  type        = string
}

variable "image_uri" {
  description = "Container image URI."
  type        = string
}

variable "container_port" {
  description = "Container port exposed to the target group."
  type        = number
}

variable "cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 256
}

variable "memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of desired ECS tasks."
  type        = number
  default     = 0
}

variable "assign_public_ip" {
  description = "Whether tasks should receive public IPs."
  type        = bool
  default     = true
}

variable "log_group_name" {
  description = "CloudWatch log group name for container logs."
  type        = string
}

variable "environment_variables" {
  description = "Plain environment variables for the container."
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "ECS secrets mapping from environment variable name to valueFrom ARN."
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Tags applied to created resources."
  type        = map(string)
  default     = {}
}

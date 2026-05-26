variable "aws_region" {
  description = "AWS region for the dev Terraform state bucket."
  type        = string
  default     = "us-west-2"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name for dev Terraform state."
  type        = string
}

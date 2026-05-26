output "bucket_name" {
  description = "S3 bucket name for dev Terraform state."
  value       = aws_s3_bucket.state.bucket
}

output "backend_key" {
  description = "Recommended dev Terraform backend state key."
  value       = "commerce-os/dev/terraform.tfstate"
}

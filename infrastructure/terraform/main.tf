terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Comment out backend if S3 bucket doesn't exist yet
  # backend "s3" {
  #   bucket = "dunkin-pos-tfstate"
  #   key    = "terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = "us-east-1"
}

# S3 Bucket for Frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "dunkin-pos-frontend-${terraform.workspace != "default" ? terraform.workspace : "dev"}"
  tags = {
    Name        = "DunkinPOSFrontend"
    Environment = terraform.workspace != "default" ? terraform.workspace : "dev"
    Project     = "CloudDunkinPOS"
  }
}

# Block public access (CloudFront will access via OAI)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Origin Access Identity for CloudFront
resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for Dunkin POS Frontend"
}

# S3 Bucket Policy to allow CloudFront access
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# CloudFront Cache Policy (modern approach)
resource "aws_cloudfront_cache_policy" "frontend" {
  name        = "dunkin-pos-cache-policy-${terraform.workspace != "default" ? terraform.workspace : "dev"}"
  comment     = "Cache policy for Dunkin POS frontend"
  default_ttl = 3600
  max_ttl     = 86400
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3Origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "Dunkin POS Frontend CDN"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    cache_policy_id = aws_cloudfront_cache_policy.frontend.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Custom error responses
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "DunkinPOS-CDN"
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "dunkin-pos-dashboard-${terraform.workspace != "default" ? terraform.workspace : "dev"}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "dunkin-pos-backend-dev-getMenu"],
            [".", "Errors", ".", "."],
            [".", "Duration", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "Lambda Function Metrics"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.cdn.id]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "CloudFront Requests"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "dunkin-pos-backend-menu-dev"],
            [".", "ConsumedWriteCapacityUnits", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "DynamoDB Capacity"
        }
      }
    ]
  })
}

# Budget Alert
resource "aws_budgets_budget" "monthly" {
  name              = "dunkin-pos-monthly-budget-${terraform.workspace != "default" ? terraform.workspace : "dev"}"
  budget_type       = "COST"
  limit_amount      = "50"
  limit_unit        = "USD"
  time_unit         = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["student@email.com"] # Update with your email
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["student@email.com"] # Update with your email
  }
}

# S3 Bucket for Images/Media
resource "aws_s3_bucket" "images" {
  bucket = "dunkin-pos-images-${terraform.workspace != "default" ? terraform.workspace : "dev"}"
  tags = {
    Name        = "DunkinPOSImages"
    Environment = terraform.workspace != "default" ? terraform.workspace : "dev"
    Project     = "CloudDunkinPOS"
  }
}

# Enable versioning for images
resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.images.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Block public access (CloudFront will serve images)
resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Identity for Images
resource "aws_cloudfront_origin_access_identity" "images" {
  comment = "OAI for Dunkin POS Images"
}

# S3 Bucket Policy for Images (CloudFront access)
resource "aws_s3_bucket_policy" "images" {
  bucket = aws_s3_bucket.images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.images.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.images.arn}/*"
      },
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.images.arn}/*"
      }
    ]
  })
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# CloudFront Distribution for Images (separate from frontend)
resource "aws_cloudfront_distribution" "images_cdn" {
  origin {
    domain_name = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id   = "S3ImagesOrigin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.images.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "Dunkin POS Images CDN"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3ImagesOrigin"

    cache_policy_id = aws_cloudfront_cache_policy.frontend.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "DunkinPOS-Images-CDN"
  }
}

# Outputs
output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.cdn.id
  description = "CloudFront Distribution ID"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.cdn.domain_name
  description = "CloudFront Distribution Domain Name"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.frontend.id
  description = "S3 Bucket Name for Frontend"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.frontend.arn
  description = "S3 Bucket ARN"
}

output "images_bucket_name" {
  value       = aws_s3_bucket.images.id
  description = "S3 Bucket Name for Images"
}

output "images_cdn_url" {
  value       = "https://${aws_cloudfront_distribution.images_cdn.domain_name}"
  description = "CloudFront URL for serving images"
}

terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
  }
  backend "kubernetes" {
    namespace     = "terraform-backend"
    secret_suffix = "me"
    config_path   = "~/.kube/config"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

locals {
  namespace = "me"
  name      = "me"
}

variable "image_tag" {
  type = string
}

resource "kubernetes_namespace_v1" "me_ns" {
  metadata {
    name = local.namespace
  }
}


resource "kubernetes_deployment_v1" "me_deploy" {
  metadata {
    name      = local.name
    namespace = local.namespace
  }

  spec {
    replicas = 3
    selector {
      match_labels = {
        app = local.name
      }
    }

    template {
      metadata {
        labels = {
          app = local.name
        }
      }
      spec {
        container {
          name  = local.name
          image = "maxrsb/me:${var.image_tag}"
          resources {
            requests = {
              cpu    = "20m"
              memory = "50Mi"
            }

            limits = {
              cpu    = "250m"
              memory = "250Mi"
            }
          }
        }
      }
    }
  }
}

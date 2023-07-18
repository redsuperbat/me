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
  hosts = ["max.netterberg.io"]
}

variable "image_tag" {
  type = string
}

resource "kubernetes_namespace_v1" "me_ns" {
  metadata {
    name = local.namespace
  }
}

resource "kubernetes_ingress_v1" "me_ingress" {

  metadata {
    name      = local.name
    namespace = local.namespace
  }

  spec {
    dynamic "rule" {
      for_each = toset(local.hosts)
      content {
        host = rule.value
        http {
          path {
            backend {
              service {
                port {
                  number = kubernetes_service_v1.me_service.spec[0].port[0].port
                }
                name = kubernetes_service_v1.me_service.metadata[0].name
              }
            }
          }
        }
      }
    }
  }
}


resource "kubernetes_service_v1" "me_service" {
  metadata {
    name      = local.name
    namespace = local.namespace
  }
  spec {
    selector = {
      app = kubernetes_deployment_v1.me_deploy.spec[0].selector[0].match_labels.app
    }

    port {
      protocol    = "TCP"
      port        = 3000
      target_port = 3000
    }
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
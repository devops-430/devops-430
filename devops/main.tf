## This script creates vm
variable "helloworld" {
    type = string
    default = "Hello World"
}

resource "null_resource" "my_instance" {
    provisioner "local-exec" {
        command = "echo ${var.helloworld}"
    }
}

output "helloworld" {
    value = var.helloworld
}

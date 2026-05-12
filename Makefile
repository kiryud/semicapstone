# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jijeong <jijeong@student.42seoul.kr>       +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/05/12 22:35:35 by jijeong           #+#    #+#              #
#    Updated: 2026/05/12 22:35:38 by jijeong          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

VOLUME_DIR = /home/jijeong/volume
DOCKER_DIR = ./server

all: up

ps:
	sudo docker-compose -f &(DOCKER_DIR)/docker-compose.yml ps


up: volume
	sudo docker-compose -f &(DOCKER_DIR)/docker-compose.yml up --build

build:
	sudo docker-compose -f &(DOCKER_DIR)/docker-compose.yml up -d --build

down:
	sudo docker-compose -f &(DOCKER_DIR)/docker-compose.yml down

clean:
	sudo docker-compose -f &(DOCKER_DIR)/docker-compose.yml down -v

re:
	sudo make fclean
	sudo make up

fclean:
	sudo make clean
	sudo docker system prune --all --force --volumes
	sudo docker network prune --force
	sudo docker volume prune --force
	sudo rm -fr $(VOLUME_DIR)

volume:
	sudo mkdir -p $(VOLUME_DIR)/wp
	sudo mkdir -p $(VOLUME_DIR)/db

.PHONY: all ps up build down clean re fclean volume
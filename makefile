
all:
	docker-compose -f docker-compose.yml up --build 

down:
	docker-compose -f docker-compose.yml down 

prune:
	docker system prune -a -f --volumes

all:
	docker compose -f docker-compose.yml up --build --watch
down:
	docker compose -f docker-compose.yml down
prune:
	rm ./backend/app/db
	docker system prune -a -f --volumes
dev:
	cd frontend && npm run dev
build:
	cd frontend && npm run build

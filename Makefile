REPOSITORY = dockerbox/apollo-cache-playground

.PHONY: .dockerignore
.dockerignore:
	pnpm exec gitignore-to-dockerignore

include ~/apps/mush/mush.mk

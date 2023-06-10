-- CreateTable
CREATE TABLE "topic" (
    "topic_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "topic_pk" PRIMARY KEY ("topic_id")
);


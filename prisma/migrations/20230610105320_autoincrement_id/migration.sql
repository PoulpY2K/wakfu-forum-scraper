-- AlterTable
CREATE SEQUENCE topic_topic_id_seq;
ALTER TABLE "topic" ALTER COLUMN "topic_id" SET DEFAULT nextval('topic_topic_id_seq');
ALTER SEQUENCE topic_topic_id_seq OWNED BY "topic"."topic_id";

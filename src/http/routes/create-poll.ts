import z from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";

export async function createPoll(app: FastifyInstance) {
  app.post("/polls", async (req, reply) => {
    const createPollBody = z.object({
      title: z.string(),
      options: z.array(z.string()),
    });

    const { title, options } = createPollBody.parse(req.body);

    console.log(title);

    const poll = await prisma.poll.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map((option) => {
              return {
                title: option,
              };
            }),
          },
        },
      },
    });
    await prisma.pollOption.createMany({
      data: options.map((option) => {
        return { title: option, pollId: poll.id };
      }),
    });

    return reply.status(201).send({ pollId: poll.id });
  });
}

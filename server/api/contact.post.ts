export default defineEventHandler(async (event) => {
  rateLimit(event, 'lead', 5, 600)
  const data = parseContactRequest(await readBody(event))
  const task = await createClickUpTask(buildContactTask(data))

  return {
    message: 'Contact message sent successfully',
    taskId: task.id,
  }
})

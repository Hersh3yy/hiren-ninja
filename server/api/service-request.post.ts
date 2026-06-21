export default defineEventHandler(async (event) => {
  const data = parseServiceRequest(await readBody(event))
  const task = await createClickUpTask(buildServiceRequestTask(data))

  return {
    message: 'Service request created successfully',
    taskId: task.id,
  }
})

interface FindEntriesTaskData {
  search: string;
}

export default async function findEntriesTask(
  taskData: FindEntriesTaskData,
): Promise<void> {
  console.log('Inside findEntriesTask, taskData: ', taskData);
}

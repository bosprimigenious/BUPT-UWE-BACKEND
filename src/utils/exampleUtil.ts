export const formatResponse = (success: boolean, message: string, data: any = null) => {
  return { success, message, data };
};

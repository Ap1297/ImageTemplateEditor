// This file contains client-side API functions to interact with the Spring Boot backend

export async function uploadTemplate(file: File): Promise<string> {
  // Validate the file is an image
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file")
  }

  // Create a FormData object to send the file
  const formData = new FormData()
  formData.append("file", file)

  // In a real implementation, this would call your Spring Boot endpoint
  // For now, we'll simulate a successful upload with a timeout
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return a mock template ID
  return "template-" + Math.random().toString(36).substring(2, 9)
}

// Update the getTemplate function to use the placeholder image
export async function getTemplate(id: string) {
  // In a real implementation, this would fetch template data from your Spring Boot endpoint
  // For now, we'll return mock data
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Check if we have a stored image in localStorage
  const storedImage = localStorage.getItem("templateImage")

  return {
    id,
    // Use the stored image if available, otherwise use the placeholder
    imageUrl: storedImage || "/birthday-template.png",
    elements: [],
  }
}

export async function saveTemplate(id: string, data: any, imageBlob: Blob): Promise<void> {
  // In a real implementation, this would save the template data to your Spring Boot endpoint
  // For now, we'll simulate a successful save with a timeout
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Return success
  return
}

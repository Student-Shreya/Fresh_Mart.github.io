// Mock implementations for Core integrations
export const UploadFile = async ({ file }) => {
    // Mock file upload - in a real app this would upload to a server
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                file_url: URL.createObjectURL(file)
            });
        }, 1000);
    });
};

export const InvokeLLM = async ({ prompt, file_urls }) => {
    // Mock LLM response - in a real app this would call an AI service
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simple mock responses based on common grocery items
            const commonItems = ['apple', 'banana', 'milk', 'bread', 'carrot', 'tomato', 'orange', 'lettuce'];
            const randomItem = commonItems[Math.floor(Math.random() * commonItems.length)];
            resolve(randomItem);
        }, 2000);
    });
};
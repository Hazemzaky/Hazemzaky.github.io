// Utility functions for user information and export/print functionality

export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return decodeJWT(token);
}

export function getCurrentDateTime(): string {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/[/]/g, '-').replace(/[,]/g, '').replace(/[:]/g, '-');
}

export function getExportFileName(pageName: string, extension: string = 'csv'): string {
  const user = getCurrentUser();
  const dateTime = getCurrentDateTime();
  const userName = user?.email || user?.name || 'unknown';
  
  // Clean the username for filename (remove special characters)
  const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${pageName}_export_${cleanUserName}_${dateTime}.${extension}`;
}

export function addExportHeader(csvContent: string, pageName: string): string {
  const user = getCurrentUser();
  const dateTime = getCurrentDateTime();
  const userName = user?.email || user?.name || 'Unknown User';
  
  const header = [
    `Export Information:`,
    `Page: ${pageName}`,
    `Exported By: ${userName}`,
    `Export Date & Time: ${dateTime}`,
    `Generated At: ${new Date().toISOString()}`,
    ``
  ].join('\n');
  
  return header + csvContent;
}

export function addPrintHeader(pageName: string): string {
  const user = getCurrentUser();
  const dateTime = getCurrentDateTime();
  const userName = user?.email || user?.name || 'Unknown User';
  
  return `
    <div style="font-family: Arial, sans-serif; margin-bottom: 20px; padding: 10px; border-bottom: 2px solid #ccc;">
      <h2 style="margin: 0 0 10px 0; color: #333;">${pageName}</h2>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">
        <strong>Exported By:</strong> ${userName}<br>
        <strong>Export Date & Time:</strong> ${dateTime}<br>
        <strong>Generated At:</strong> ${new Date().toISOString()}
      </p>
    </div>
  `;
} 
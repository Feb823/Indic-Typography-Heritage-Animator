import fs from 'fs';
import path from 'path';

const dbFilePath = path.join(process.cwd(), 'data', 'history.json');

export interface HistoryRecord {
  id: string;
  timestamp: string;
  style: string;
  prompt: string;
  patternUrl: string;
}

// Helper to ensure database directory and file exist
function initDb() {
  const dirPath = path.dirname(dbFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function getGenerationHistory(): Promise<HistoryRecord[]> {
  try {
    initDb();
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data) as HistoryRecord[];
  } catch (error) {
    console.error('Failed to read generation history db:', error);
    return [];
  }
}

export async function saveGenerationRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>): Promise<HistoryRecord> {
  try {
    initDb();
    const history = await getGenerationHistory();
    
    const newRecord: HistoryRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
    };
    
    // Unshift to place latest at top of list
    history.unshift(newRecord);
    
    // Cap at 20 items to avoid bloated storage
    const cappedHistory = history.slice(0, 20);
    
    fs.writeFileSync(dbFilePath, JSON.stringify(cappedHistory, null, 2), 'utf-8');
    return newRecord;
  } catch (error) {
    console.error('Failed to save generation record to db:', error);
    return {
      ...record,
      id: 'fallback-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
  }
}

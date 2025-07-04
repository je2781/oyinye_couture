import * as path from 'path';
import * as fs from 'fs/promises';

export const months = [
  'Jan',
  'Feb' ,
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export function randomReference() {
  let length = 8;
  let chars = "0123456789abcdefghijklmnopqrstuvwxyz_?£&*%!#%><ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}



export  function getDeviceType(userAgent: string) {

  if (/Mobile|Android|iPhone/i.test(userAgent)) {
      return 'Mobile';
  }

  if (/Tablet|iPad|Playbook|Silk/i.test(userAgent)) {
      return 'Tablet';
  }

  return 'Desktop';
}

export function getBrowser(userAgent: string) {
  if (userAgent.includes('Edg/')) {
      return 'Edge (Chromium)';
  } else if (userAgent.includes('Edge/')) {
      return 'Edge (Legacy)';
  } else if (userAgent.includes('Chrome')) {
      return 'Chrome';
  } else if (userAgent.includes('Safari')) {
      return 'Safari';
  } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      return 'IE'; // Internet Explorer
  } else {
      return 'Unknown';
  }
}

export async function saveFile(part: any): Promise<{ filename: string; filepath: string; mimetype: string }> {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(part.filename);
  const filename = `${part.fieldname}-${uniqueSuffix}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  await fs.mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);

  const writeStream = await fs.open(filepath, 'w');
  await new Promise<void>((resolve, reject) => {
    part.file.pipe(writeStream.createWriteStream());
    part.file.on('end', () => resolve());
    part.file.on('error', (err) => reject(err));
  });
  await writeStream.close();

  return { filename, filepath, mimetype: part.mimetype };
}


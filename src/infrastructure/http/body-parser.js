export async function parseRequestBody(request) {
  const contentType = request.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartBody(request, contentType);
  }

  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch {
        resolve({});
      }
    });
  });
}

async function parseMultipartBody(request, contentType) {
  return new Promise((resolve, reject) => {
    const boundary = getBoundary(contentType);
    if (!boundary) {
      reject(new Error('Invalid multipart boundary'));
      return;
    }

    let buffer = Buffer.alloc(0);

    request.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    request.on('end', () => {
      try {
        const parts = parseMultipartData(buffer, boundary);
        const result = {};

        for (const part of parts) {
          if (part.filename) {
            // File field
            result.file = {
              filename: part.filename,
              contentType: part.contentType,
              data: part.data
            };
          } else {
            // Regular field
            result[part.name] = part.data.toString();
          }
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

function getBoundary(contentType) {
  const match = contentType.match(/boundary=([^;]+)/);
  return match ? match[1] : null;
}

function parseMultipartData(buffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`);

  const parts = [];
  let offset = buffer.indexOf(boundaryBuffer);

  while (offset !== -1) {
    const nextBoundary = buffer.indexOf(boundaryBuffer, offset + boundaryBuffer.length);
    const endBoundary = buffer.indexOf(endBoundaryBuffer, offset + boundaryBuffer.length);

    let endPos;
    if (nextBoundary !== -1 && (endBoundary === -1 || nextBoundary < endBoundary)) {
      endPos = nextBoundary;
    } else {
      endPos = endBoundary;
    }

    if (endPos === -1) break;

    const partBuffer = buffer.subarray(offset + boundaryBuffer.length, endPos);
    const part = parsePart(partBuffer);
    if (part) {
      parts.push(part);
    }

    offset = endPos;
    if (buffer.subarray(offset, offset + endBoundaryBuffer.length).equals(endBoundaryBuffer)) {
      break;
    }
  }

  return parts;
}

function parsePart(partBuffer) {
  const headersEnd = partBuffer.indexOf('\r\n\r\n');
  if (headersEnd === -1) return null;

  const headersText = partBuffer.subarray(0, headersEnd).toString();
  const data = partBuffer.subarray(headersEnd + 4).slice(0, -2); // Remove \r\n

  const headers = {};
  const headerLines = headersText.split('\r\n');

  for (const line of headerLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const name = line.substring(0, colonIndex).toLowerCase().trim();
      const value = line.substring(colonIndex + 1).trim();
      headers[name] = value;
    }
  }

  // Parse Content-Disposition
  const disposition = headers['content-disposition'];
  if (!disposition) return null;

  const nameMatch = disposition.match(/name="([^"]+)"/);
  const filenameMatch = disposition.match(/filename="([^"]+)"/);

  return {
    name: nameMatch ? nameMatch[1] : 'unknown',
    filename: filenameMatch ? filenameMatch[1] : null,
    contentType: headers['content-type'] || 'text/plain',
    data: data
  };
}

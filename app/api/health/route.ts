import { NextResponse } from 'next/server';
import os from 'os';
import { promises as fs } from 'fs';
import path from 'path';
import packageJson from '../../../package.json';

// Define the health object type to fix linter errors
type HealthInfo = {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  node: {
    version: string;
    platform: string;
    arch: string;
    memory: {
      total: string;
      free: string;
      usage: string;
    };
    cpus: number;
  };
  app: {
    name: string;
    version: string;
    dependencies: number;
    nextVersion: string;
  };
  disk?: {
    directory?: string;
    free?: string;
    appSize?: string;
    error?: string;
  };
}

export async function GET() {
  try {
    // Basic health information
    const health: HealthInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      
      // Node.js info
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          total: `${Math.round(os.totalmem() / (1024 * 1024))} MB`,
          free: `${Math.round(os.freemem() / (1024 * 1024))} MB`,
          usage: `${Math.round((1 - os.freemem() / os.totalmem()) * 100)}%`
        },
        cpus: os.cpus().length
      },
      
      // App info
      app: {
        name: packageJson.name,
        version: packageJson.version,
        dependencies: Object.keys(packageJson.dependencies).length,
        nextVersion: packageJson.dependencies.next
      }
    };

    // Check disk space
    try {
      const appDir = process.cwd();
      const stats = await fs.stat(appDir);
      health.disk = {
        directory: appDir,
        free: 'N/A', // Not available in all Node.js environments
        appSize: `${Math.round(stats.size / 1024)} KB`
      };
    } catch (e) {
      health.disk = { error: 'Cannot access disk information' };
    }

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to gather health information' },
      { status: 500 }
    );
  }
} 
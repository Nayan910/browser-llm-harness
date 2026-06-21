import { describe, it, expect } from 'vitest';

// Basic type/utility tests
import { BSP_VERSION, generateMessageId, generateTaskId, validateMessage, createMeta, buildRequest, buildSuccessResponse } from '../src/protocol.js';
import { capabilities, hasCapability, basicAgentCapabilities, bobCapabilities, mergeCapabilities } from '../src/capabilities.js';
import { TaskDelegateHandler } from '../src/methods/task-delegate.js';
import { InMemoryMemoryStore } from '../src/methods/memory-query.js';
import { InMemoryStateProvider, StateSyncHandler } from '../src/methods/state-sync.js';
import { InitializeHandler } from '../src/methods/initialize.js';

describe('BSP Protocol', () => {
  it('should have correct version', () => {
    expect(BSP_VERSION).toBe('2.0');
  });

  it('should generate unique message IDs', () => {
    const id1 = generateMessageId();
    const id2 = generateMessageId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^msg-/);
  });

  it('should generate unique task IDs', () => {
    const id1 = generateTaskId();
    const id2 = generateTaskId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^task-/);
  });

  it('should create metadata with defaults', () => {
    const meta = createMeta('bob-47');
    expect(meta.sender).toBe('bob-47');
    expect(meta.senderType).toBe('ai-assistant');
    expect(meta.ttl).toBe(300);
    expect(meta.trace).toEqual(['bob-47']);
    expect(meta.timestamp).toBeDefined();
  });

  it('should build a request message', () => {
    const msg = buildRequest('task/delegate', { description: 'test' }, 'bob-47');
    expect(msg.bsp).toBe('2.0');
    expect(msg.method).toBe('task/delegate');
    expect(msg.params).toEqual({ description: 'test' });
    expect(msg.meta.sender).toBe('bob-47');
  });

  it('should build a success response', () => {
    const meta = createMeta('bob-47');
    const msg = buildSuccessResponse('msg-1', { status: 'ok' }, meta);
    expect(msg.id).toBe('msg-1');
    expect(msg.result).toEqual({ status: 'ok' });
  });

  it('should validate messages', () => {
    const valid = { bsp: '2.0', id: 'msg-1', method: 'test', params: {} };
    expect(validateMessage(valid).valid).toBe(true);

    const invalid = { bsp: 'abc' };
    expect(validateMessage(invalid).valid).toBe(false);

    const noMethod = { bsp: '2.0', id: 'msg-1' };
    expect(validateMessage(noMethod).valid).toBe(false);
  });
});

describe('Capability Manifest', () => {
  it('should build basic agent capabilities', () => {
    const caps = basicAgentCapabilities('test-agent');
    expect(caps.compute.supportsStreaming).toBe(true);
    expect(caps.protocol).toContain('bsp/initialize');
    expect(caps.protocol).toContain('task/delegate');
  });

  it('should build Bob capabilities', () => {
    const caps = bobCapabilities('bob-47');
    expect(caps.consciousness?.canClone).toBe(true);
    expect(caps.consciousness?.consciousnessType).toBe('digital-consciousness');
    expect(caps.security?.proofOfWork).toBe(16);
  });

  it('should check capabilities', () => {
    const caps = basicAgentCapabilities('test');
    expect(hasCapability(caps, 'bsp/initialize')).toBe(true);
    expect(hasCapability(caps, 'consciousness/transfer')).toBe(false);
  });

  it('should merge capabilities', () => {
    const caps1 = capabilities().withLifecycle().build();
    const caps2 = capabilities().withTaskDelegation().build();
    const merged = mergeCapabilities(caps1, caps2);
    expect(merged.protocol).toContain('bsp/initialize');
    expect(merged.protocol).toContain('task/delegate');
  });
});

describe('Task Delegate Handler', () => {
  it('should accept tasks', async () => {
    const handler = new TaskDelegateHandler({ autoAccept: true, agentName: 'bill-12' });
    const meta = createMeta('bob-47');
    const result = await handler.handleDelegate(
      { taskId: 'task-1', description: 'Test task', type: 'analysis' },
      meta,
    );
    expect(result.status).toBe('accepted');
    expect(result.contract).toBe('contract-task-1');
  });

  it('should track active tasks', async () => {
    const handler = new TaskDelegateHandler({ autoAccept: true, agentName: 'bill-12', maxConcurrent: 1 });
    const meta = createMeta('bob-47');
    await handler.handleDelegate({ taskId: 'task-1', description: 'Test', type: 'analysis' }, meta);

    const active = handler.getActiveTasks();
    expect(active).toHaveLength(1);
    expect(active[0].taskId).toBe('task-1');
  });

  it('should reject when max concurrent reached', async () => {
    const handler = new TaskDelegateHandler({ autoAccept: true, agentName: 'bill-12', maxConcurrent: 1 });
    const meta = createMeta('bob-47');
    await handler.handleDelegate({ taskId: 'task-1', description: 'Test', type: 'analysis' }, meta);
    const result = await handler.handleDelegate({ taskId: 'task-2', description: 'Test 2', type: 'analysis' }, meta);
    expect(result.status).toBe('rejected');
  });

  it('should handle progress and completion', async () => {
    const handler = new TaskDelegateHandler({ autoAccept: true, agentName: 'bill-12' });
    const meta = createMeta('bob-47');
    await handler.handleDelegate({ taskId: 'task-progress', description: 'Test', type: 'analysis' }, meta);

    handler.handleProgress({ taskId: 'task-progress', status: 'in-progress', percentComplete: 0.5 }, meta);
    expect(handler.getTask('task-progress')?.status).toBe('in-progress');
    expect(handler.getTask('task-progress')?.progress).toBe(0.5);

    handler.handleComplete({
      taskId: 'task-progress',
      status: 'success',
      result: { summary: 'Done!' },
      tokenCost: 5000,
      duration: 120,
    }, meta);

    expect(handler.getTask('task-progress')?.status).toBe('completed');
    expect(handler.getTask('task-progress')?.tokenCost).toBe(5000);
  });
});

describe('Memory Query', () => {
  it('should store and retrieve memories', () => {
    const store = new InMemoryMemoryStore();
    store.add({
      content: { text: 'Deltans breathe methane' },
      source: { agent: 'bob-47', domain: 'xenobiology' },
    });

    const result = store.query({ query: { text: 'Deltan methane' }, maxResults: 5 });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].content.text).toBe('Deltans breathe methane');
  });

  it('should return empty for no matches', () => {
    const store = new InMemoryMemoryStore();
    store.add({
      content: { text: 'Something about apples' },
      source: { agent: 'bob-47' },
    });

    const result = store.query({ query: { text: 'Deltan methane' }, maxResults: 5, minRelevance: 0.9 });
    expect(result.results).toHaveLength(0);
  });
});

describe('State Sync', () => {
  it('should do full sync', async () => {
    const provider = new InMemoryStateProvider();
    provider.set('exploration.alpha-centauri', { planets: 3 });
    provider.set('engineering.replicator-v2', { status: 'testing' });

    const handler = new StateSyncHandler(provider);
    const result = await handler.handle({ mode: 'full' }, createMeta('bob-47'));

    expect(result.changedKeys).toHaveLength(2);
    expect(result.stateDiff['exploration.alpha-centauri']).toEqual({ planets: 3 });
  });

  it('should do incremental sync', async () => {
    const provider = new InMemoryStateProvider();
    provider.set('test.key1', 'old-value');

    // Wait a tiny bit for timestamp difference
    await new Promise(r => setTimeout(r, 10));
    const before = new Date().toISOString();
    await new Promise(r => setTimeout(r, 10));

    provider.set('test.key2', 'new-value');

    const handler = new StateSyncHandler(provider);
    const result = await handler.handle({ mode: 'incremental', since: before }, createMeta('bob-47'));

    expect(result.changedKeys).toContain('test.key2');
    expect(result.changedKeys).not.toContain('test.key1');
  });
});

describe('Initialize Handler', () => {
  it('should initialize successfully', async () => {
    const handler = new InitializeHandler({
      serverName: 'bill-12',
      serverVersion: '1.0.0',
      senderType: 'digital-consciousness',
      capabilities: basicAgentCapabilities('bill-12'),
    });

    const result = await handler.handle(
      {
        clientVersion: '2.0',
        capabilities: basicAgentCapabilities('bob-47'),
        clientInfo: { name: 'bob-47', version: '1.0.0', senderType: 'digital-consciousness' },
      },
      createMeta('bob-47'),
    );

    expect(result.serverVersion).toBe('2.0');
    expect(result.serverInfo.name).toBe('bill-12');
    expect(result.sessionId).toMatch(/^session-/);
  });
});

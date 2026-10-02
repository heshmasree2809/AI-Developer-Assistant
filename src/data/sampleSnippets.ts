import { AnalysisType, Language } from '../types';

export interface CodeSnippetPreset {
  id: string;
  name: string;
  language: Language;
  recommendedType: AnalysisType;
  description: string;
  code: string;
}

export const SAMPLE_SNIPPETS: CodeSnippetPreset[] = [
  {
    id: 'bug-sql-auth',
    name: 'Insecure Auth & SQL Injection Vulnerability',
    language: 'python',
    recommendedType: 'bugs',
    description: 'Vulnerable user lookup with string interpolation and missing password verification salt.',
    code: `import sqlite3
import hashlib

def authenticate_user(db_path: str, username_input: str, password_input: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # CRITICAL BUG: SQL Injection via string formatting
    query = f"SELECT id, username, password_hash, role FROM users WHERE username = '{username_input}'"
    cursor.execute(query)
    user_row = cursor.fetchone()
    
    # BUG: NoneType dereference if user not found
    stored_hash = user_row[2]
    
    # WEAK CRYPTO: Plain MD5 hash without salt or work factor
    input_hash = hashlib.md5(password_input.encode()).hexdigest()
    
    if input_hash == stored_hash:
        # BUG: Connection is never closed, leading to resource leakage
        return {"id": user_row[0], "username": user_row[1], "role": user_row[3]}
        
    return None
`,
  },
  {
    id: 'review-payment-worker',
    name: 'E-Commerce Payment Processor',
    language: 'typescript',
    recommendedType: 'review',
    description: 'Complex payment orchestrator with idempotency checks and webhook retry logic.',
    code: `import { EventEmitter } from 'events';

export class PaymentProcessor extends EventEmitter {
  private activeTransactions = new Map<string, any>();
  private maxRetries = 3;

  async processOrderPayment(orderId: string, customerId: string, amount: number, paymentMethod: string) {
    if (amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    const txId = \`tx_\${orderId}_\${Date.now()}\`;
    this.activeTransactions.set(txId, { status: 'PENDING', amount, customerId });

    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        const result = await this.callGateway(paymentMethod, amount);
        if (result.success) {
          this.activeTransactions.set(txId, { status: 'COMPLETED', gatewayId: result.id });
          this.emit('payment:success', { orderId, txId, amount });
          return { success: true, txId };
        }
      } catch (err) {
        attempts++;
        if (attempts >= this.maxRetries) {
          this.activeTransactions.set(txId, { status: 'FAILED', error: (err as Error).message });
          this.emit('payment:failed', { orderId, txId, attempts });
          throw err;
        }
      }
    }
  }

  private async callGateway(method: string, amount: number) {
    // Simulated remote call
    return { success: true, id: 'ch_984328492' };
  }
}
`,
  },
  {
    id: 'refactor-legacy-calculator',
    name: 'Monolithic Discount & Tax Calculator',
    language: 'python',
    recommendedType: 'refactor',
    description: 'Nested conditionals and repetitive calculations ready for Clean Architecture refactoring.',
    code: `def calculate_cart_total(items, customer_type, coupon_code, country_code, is_holiday):
    subtotal = 0
    for item in items:
        if item['type'] == 'book':
            subtotal = subtotal + item['price'] * item['qty']
        elif item['type'] == 'electronics':
            subtotal = subtotal + item['price'] * item['qty'] * 1.05
        else:
            subtotal = subtotal + item['price'] * item['qty']

    discount = 0
    if customer_type == 'VIP':
        discount = discount + 0.15 * subtotal
    elif customer_type == 'GOLD':
        discount = discount + 0.10 * subtotal
    elif customer_type == 'NEW':
        discount = discount + 0.05 * subtotal

    if coupon_code == 'SUPER50' and subtotal > 100:
        discount = discount + 50
    elif coupon_code == 'TENPERCENT':
        discount = discount + (subtotal * 0.1)

    tax_rate = 0.0
    if country_code == 'US':
        tax_rate = 0.08
    elif country_code == 'CA':
        tax_rate = 0.13
    elif country_code == 'UK':
        tax_rate = 0.20
    else:
        tax_rate = 0.10

    if is_holiday:
        discount = discount + 10

    final_total = (subtotal - discount) * (1 + tax_rate)
    return round(final_total, 2)
`,
  },
  {
    id: 'tests-user-service',
    name: 'User Password Policy & Token Validator',
    language: 'typescript',
    recommendedType: 'tests',
    description: 'Functions for password entropy, password strength scoring, and JWT claim extraction.',
    code: `export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 25;
  }

  if (/[A-Z]/.test(password)) score += 25;
  else errors.push('Password must contain at least one uppercase letter');

  if (/[0-9]/.test(password)) score += 25;
  else errors.push('Password must contain at least one numerical digit');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;
  else errors.push('Password must contain at least one special character');

  return {
    isValid: errors.length === 0,
    score,
    errors,
  };
}

export function sanitizeUsername(rawName: string): string {
  if (!rawName) return '';
  return rawName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}
`,
  },
  {
    id: 'docs-rate-limiter',
    name: 'Token Bucket Rate Limiter Algorithm',
    language: 'go',
    recommendedType: 'documentation',
    description: 'Thread-safe token bucket rate limiter implementation with atomic refills.',
    code: `package ratelimit

import (
	"sync"
	"time"
)

type TokenBucket struct {
	mu         sync.Mutex
	capacity   int64
	tokens     float64
	refillRate float64
	lastRefill time.Time
}

func NewTokenBucket(capacity int64, refillRatePerSec float64) *TokenBucket {
	return &TokenBucket{
		capacity:   capacity,
		tokens:     float64(capacity),
		refillRate: refillRatePerSec,
		lastRefill: time.Now(),
	}
}

func (tb *TokenBucket) Allow(tokensRequested int64) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	tb.lastRefill = now

	tb.tokens = tb.tokens + (elapsed * tb.refillRate)
	if tb.tokens > float64(tb.capacity) {
		tb.tokens = float64(tb.capacity)
	}

	if tb.tokens >= float64(tokensRequested) {
		tb.tokens -= float64(tokensRequested)
		return true
	}
	return false
}
`,
  },
  {
    id: 'explain-lru-cache',
    name: 'LRU Cache with Doubly Linked List',
    language: 'python',
    recommendedType: 'explain',
    description: 'Double-ended queue and hash map implementation achieving O(1) reads and writes.',
    code: `class Node:
    def __init__(self, key: int, value: int):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        # Dummy head and tail nodes
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        prev_node = node.prev
        next_node = node.next
        prev_node.next = next_node
        next_node.prev = prev_node

    def _add(self, node: Node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add(node)
            return node.value
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self._add(node)
        self.cache[key] = node
        if len(self.cache) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]
`,
  }
];

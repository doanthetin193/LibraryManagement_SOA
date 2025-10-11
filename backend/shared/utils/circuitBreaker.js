// Circuit Breaker for service resilience
class CircuitBreaker {
  constructor(serviceName, failureThreshold = 5, recoveryTimeout = 30000) {
    this.serviceName = serviceName;
    this.failureCount = 0;
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async call(serviceFunction, ...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`${this.serviceName} circuit breaker OPEN`);
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await serviceFunction(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeout;
      console.warn(`🔧 Circuit breaker OPEN for ${this.serviceName}`);
    }
  }
}

module.exports = CircuitBreaker;
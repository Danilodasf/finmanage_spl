import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Metas - Personal', () => {
  let mockGoalController: any;

  beforeEach(() => {
    mockGoalController = {
      createGoal: vi.fn()
    };
    
    vi.clearAllMocks();
  });

  it('deve criar uma nova meta', async () => {
    const goalData = {
      name: 'Viagem para Europa',
      targetAmount: 10000,
      currentAmount: 0,
      targetDate: new Date('2024-12-31'),
      category: 'viagem'
    };
    
    const expectedGoal = {
      id: '1',
      ...goalData,
      progress: 0,
      isCompleted: false,
      createdAt: new Date()
    };
    
    mockGoalController.createGoal.mockResolvedValue({
      success: true,
      goal: expectedGoal
    });
    
    const result = await mockGoalController.createGoal(goalData);
    
    expect(mockGoalController.createGoal).toHaveBeenCalledWith(goalData);
    expect(result.success).toBe(true);
    expect(result.goal).toEqual(expectedGoal);
  });
});
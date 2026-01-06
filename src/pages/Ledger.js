import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import ledgerService from '../api/ledgerService';
import '../styles/ledger.css';

export default function Ledger() {
  // 필터 상태
  const [filterType, setFilterType] = useState('all'); // 'all', 'monthly', 'quarterly'
  const [selectedMonth, setSelectedMonth] = useState(''); // '2025-01' 형식
  const [selectedQuarter, setSelectedQuarter] = useState(''); // 'Q1', 'Q2', 'Q3', 'Q4'
  const [selectedYear, setSelectedYear] = useState('2025');

  // API에서 거래 내역 조회
  const { data: allTransactions = [], isLoading, isError } = useQuery({
    queryKey: ['ledger-transactions'],
    queryFn: () => ledgerService.getTransactions({ auth: false })
  });

  // 샘플 데이터 (백업용 - API 연동 전까지 사용)
  const sampleTransactions = [
    // 1분기 (1-3월)
    { id: 1, date: '2025-01-15', type: 'income', category: '회비', amount: 50000, description: '1월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 2, date: '2025-01-20', type: 'expense', category: '이벤트', amount: 30000, description: '신년 이벤트 상금', memo: '1등 상금 지급' },
    { id: 3, date: '2025-01-25', type: 'income', category: '후원', amount: 100000, description: '스트리머 후원금', memo: '방송 후원금 입금' },
    { id: 4, date: '2025-01-28', type: 'expense', category: '식비', amount: 45000, description: '정기 모임 식사비', memo: '5명 참석' },
    { id: 5, date: '2025-02-01', type: 'income', category: '펀딩', amount: 80000, description: '클랜 펀딩', memo: '멤버들 자발적 펀딩' },
    { id: 6, date: '2025-02-05', type: 'expense', category: '기타', amount: 25000, description: '서버 유지비', memo: '디스코드 부스트' },
    { id: 7, date: '2025-02-10', type: 'income', category: '회비', amount: 50000, description: '2월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 8, date: '2025-02-14', type: 'expense', category: '이벤트', amount: 50000, description: '발렌타인데이 이벤트', memo: '상금 및 경품 구입' },
    { id: 9, date: '2025-03-05', type: 'income', category: '회비', amount: 50000, description: '3월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 10, date: '2025-03-15', type: 'expense', category: '식비', amount: 60000, description: '봄맞이 모임', memo: '8명 참석' },

    // 2분기 (4-6월)
    { id: 11, date: '2025-04-10', type: 'income', category: '회비', amount: 50000, description: '4월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 12, date: '2025-04-20', type: 'expense', category: '이벤트', amount: 70000, description: '봄 대회 상금', memo: '우승팀 상금' },
    { id: 13, date: '2025-05-05', type: 'income', category: '후원', amount: 120000, description: '스트리머 후원금', memo: '특별 후원' },
    { id: 14, date: '2025-05-15', type: 'income', category: '회비', amount: 50000, description: '5월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 15, date: '2025-06-01', type: 'expense', category: '기타', amount: 30000, description: '장비 구입', memo: '헤드셋 구입' },
    { id: 16, date: '2025-06-10', type: 'income', category: '회비', amount: 50000, description: '6월 정기 회비', memo: '10명 회비 입금 완료' },

    // 3분기 (7-9월)
    { id: 17, date: '2025-07-05', type: 'income', category: '회비', amount: 50000, description: '7월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 18, date: '2025-07-20', type: 'expense', category: '이벤트', amount: 80000, description: '여름 이벤트', memo: '상금 및 간식' },
    { id: 19, date: '2025-08-10', type: 'income', category: '펀딩', amount: 100000, description: '여름 펀딩', memo: '특별 모금' },
    { id: 20, date: '2025-08-15', type: 'income', category: '회비', amount: 50000, description: '8월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 21, date: '2025-09-05', type: 'expense', category: '식비', amount: 55000, description: '추석 모임', memo: '7명 참석' },
    { id: 22, date: '2025-09-15', type: 'income', category: '회비', amount: 50000, description: '9월 정기 회비', memo: '10명 회비 입금 완료' },

    // 4분기 (10-12월)
    { id: 23, date: '2025-10-10', type: 'income', category: '회비', amount: 50000, description: '10월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 24, date: '2025-10-31', type: 'expense', category: '이벤트', amount: 90000, description: '할로윈 이벤트', memo: '경품 및 상금' },
    { id: 25, date: '2025-11-15', type: 'income', category: '회비', amount: 50000, description: '11월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 26, date: '2025-11-20', type: 'expense', category: '기타', amount: 40000, description: '서버 유지비', memo: '연간 구독' },
    { id: 27, date: '2025-12-10', type: 'income', category: '회비', amount: 50000, description: '12월 정기 회비', memo: '10명 회비 입금 완료' },
    { id: 28, date: '2025-12-25', type: 'expense', category: '이벤트', amount: 100000, description: '크리스마스 이벤트', memo: '선물 및 상금' }
  ];

  // 실제 사용할 거래 내역 (API 데이터가 없으면 샘플 데이터 사용)
  const transactions = isError
    ? sampleTransactions
    : Array.isArray(allTransactions)
      ? allTransactions
      : [];

  // 분기 판단 함수
  const getQuarter = (date) => {
    const month = new Date(date).getMonth() + 1;
    if (month >= 1 && month <= 3) return 'Q1';
    if (month >= 4 && month <= 6) return 'Q2';
    if (month >= 7 && month <= 9) return 'Q3';
    return 'Q4';
  };

  // 필터링된 거래 내역
  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') {
      return transactions;
    }

    if (filterType === 'monthly' && selectedMonth) {
      return transactions.filter(t => t.date.startsWith(selectedMonth));
    }

    if (filterType === 'quarterly' && selectedQuarter) {
      return transactions.filter(t => {
        const year = t.date.split('-')[0];
        return year === selectedYear && getQuarter(t.date) === selectedQuarter;
      });
    }

    return transactions;
  }, [filterType, selectedMonth, selectedQuarter, selectedYear, transactions]);

  // 총 수입 계산
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 총 지출 계산
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 잔액 계산
  const balance = totalIncome - totalExpense;

  // 카테고리별 수입 통계
  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const incomeChartData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // 카테고리별 지출 통계
  const expenseByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const expenseChartData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 모던하고 세련된 색상 팔레트
  const INCOME_COLORS = ['#667eea', '#764ba2', '#3b82f6', '#06b6d4'];
  const EXPENSE_COLORS = ['#ff6b6b', '#ff8c42', '#ff5e3a', '#ff9a56'];

  // 월 목록 생성 (2025년)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return `2025-${month}`;
  });

  // 현재 필터 레이블
  const getFilterLabel = () => {
    if (filterType === 'all') return '전체 기간';
    if (filterType === 'monthly' && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      return `${year}년 ${parseInt(month)}월`;
    }
    if (filterType === 'quarterly' && selectedQuarter) {
      return `${selectedYear}년 ${selectedQuarter}`;
    }
    return '기간 선택';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="ledger-page">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            fontSize: '1.25rem',
            color: '#64748b'
          }}>
            로딩 중...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="ledger-page">
        {/* 헤더 */}
        <div className="ledger-header">
          <div>
            <h1 className="ledger-title">Fund Ledger</h1>
            <p className="ledger-subtitle">클랜 공금 수입 및 지출 내역</p>
          </div>
          {isError && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              데이터를 불러오는데 실패했습니다. 샘플 데이터를 표시합니다.
            </div>
          )}
          {!isError && transactions.length === 0 && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#eef2ff',
              color: '#4338ca',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              아직 등록된 거래가 없습니다.
            </div>
          )}
        </div>

        {/* 필터 섹션 */}
        <div className="filter-section">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              전체
            </button>
            <button
              className={`filter-tab ${filterType === 'monthly' ? 'active' : ''}`}
              onClick={() => setFilterType('monthly')}
            >
              월별
            </button>
            <button
              className={`filter-tab ${filterType === 'quarterly' ? 'active' : ''}`}
              onClick={() => setFilterType('quarterly')}
            >
              분기별
            </button>
          </div>

          <div className="filter-selectors">
            {filterType === 'monthly' && (
              <select
                className="filter-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">월 선택</option>
                {monthOptions.map(month => (
                  <option key={month} value={month}>
                    {month.split('-')[0]}년 {parseInt(month.split('-')[1])}월
                  </option>
                ))}
              </select>
            )}

            {filterType === 'quarterly' && (
              <div className="quarter-selector">
                <select
                  className="filter-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2025">2025년</option>
                  <option value="2024">2024년</option>
                </select>
                <div className="quarter-buttons">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                    <button
                      key={q}
                      className={`quarter-btn ${selectedQuarter === q ? 'active' : ''}`}
                      onClick={() => setSelectedQuarter(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="filter-result">
            <span className="filter-label">조회 기간:</span>
            <span className="filter-value">{getFilterLabel()}</span>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="ledger-summary">
          <div className="summary-card summary-income">
            <div className="summary-icon">💵</div>
            <div className="summary-content">
              <div className="summary-label">총 수입</div>
              <div className="summary-value">₩{formatAmount(totalIncome)}</div>
            </div>
          </div>
          <div className="summary-card summary-expense">
            <div className="summary-icon">💸</div>
            <div className="summary-content">
              <div className="summary-label">총 지출</div>
              <div className="summary-value">₩{formatAmount(totalExpense)}</div>
            </div>
          </div>
          <div className="summary-card summary-balance">
            <div className="summary-icon">💎</div>
            <div className="summary-content">
              <div className="summary-label">현재 잔액</div>
              <div className={`summary-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                ₩{formatAmount(balance)}
              </div>
            </div>
          </div>
        </div>

        {/* 차트 섹션 */}
        {(incomeChartData.length > 0 || expenseChartData.length > 0) && (
          <div className="charts-section">
            {incomeChartData.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">📊 수입 상세</h3>
              <div className="chart-container-modern">
                <div className="chart-center-label">
                  <div className="chart-center-title">총 수입</div>
                  <div className="chart-center-value income">₩{formatAmount(totalIncome)}</div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={incomeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {incomeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                          style={{
                            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₩${formatAmount(value)}`}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="category-stats-modern">
                {incomeChartData.map((item, index) => (
                  <div key={index} className="stat-item-modern">
                    <div className="stat-color-bar" style={{ backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length] }}></div>
                    <div className="stat-info">
                      <div className="stat-name">{item.name}</div>
                      <div className="stat-amount income">₩{formatAmount(item.value)}</div>
                    </div>
                    <div className="stat-percentage">
                      {((item.value / totalIncome) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {expenseChartData.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">📊 지출 상세</h3>
              <div className="chart-container-modern">
                <div className="chart-center-label">
                  <div className="chart-center-title">총 지출</div>
                  <div className="chart-center-value expense">₩{formatAmount(totalExpense)}</div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                          style={{
                            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₩${formatAmount(value)}`}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="category-stats-modern">
                {expenseChartData.map((item, index) => (
                  <div key={index} className="stat-item-modern">
                    <div className="stat-color-bar" style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}></div>
                    <div className="stat-info">
                      <div className="stat-name">{item.name}</div>
                      <div className="stat-amount expense">₩{formatAmount(item.value)}</div>
                    </div>
                    <div className="stat-percentage">
                      {((item.value / totalExpense) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        )}

        {/* 노션 스타일 테이블 */}
        <div className="notion-table-container">
          <div className="table-header">
            <h2 className="table-title">📋 거래 내역</h2>
            <div className="table-info">총 {filteredTransactions.length}건</div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="notion-table">
              <table>
                <thead>
                  <tr>
                    <th className="col-date">날짜</th>
                    <th className="col-type">구분</th>
                    <th className="col-category">카테고리</th>
                    <th className="col-description">내용</th>
                    <th className="col-amount">금액</th>
                    <th className="col-balance">잔액</th>
                    <th className="col-memo">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => {
                    // 각 거래 시점의 잔액 계산
                    const currentBalance = filteredTransactions
                      .slice(0, index + 1)
                      .reduce((acc, t) => {
                        return t.type === 'income' ? acc + t.amount : acc - t.amount;
                      }, 0);

                    return (
                      <tr key={transaction.id} className="notion-row">
                        <td className="col-date">
                          <span className="date-text">{transaction.date}</span>
                        </td>
                        <td className="col-type">
                          <span className={`type-tag ${transaction.type}`}>
                            {transaction.type === 'income' ? '수입' : '지출'}
                          </span>
                        </td>
                        <td className="col-category">
                          <span className="category-tag">{transaction.category}</span>
                        </td>
                        <td className="col-description">
                          <span className="description-text">{transaction.description}</span>
                        </td>
                        <td className="col-amount">
                          <span className={`amount-text ${transaction.type}`}>
                            {transaction.type === 'income' ? '+' : '-'}₩{formatAmount(transaction.amount)}
                          </span>
                        </td>
                        <td className="col-balance">
                          <span className={`balance-text ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
                            ₩{formatAmount(currentBalance)}
                          </span>
                        </td>
                        <td className="col-memo">
                          <span className="memo-text">{transaction.memo}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>선택한 기간에 거래 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

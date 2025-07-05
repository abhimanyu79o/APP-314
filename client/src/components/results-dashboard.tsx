import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

interface VoteStats {
  candidates: {
    id: number;
    name: string;
    party: string;
    votes: number;
    percentage: string;
  }[];
  totalVotes: number;
  turnoutPercentage: string;
}

const COLORS = ['hsl(207, 90%, 54%)', 'hsl(0, 84%, 60%)', 'hsl(136, 39%, 43%)', 'hsl(34, 100%, 48%)'];

export function ResultsDashboard() {
  const { data: stats, isLoading } = useQuery<VoteStats>({
    queryKey: ["/api/votes/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-xl shadow-lg border border-neutral-200">
          <CardContent className="p-6">
            <div className="h-80 bg-neutral-100 animate-pulse rounded-lg"></div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border border-neutral-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Results Available</h3>
        <p className="text-neutral-600">Vote statistics will appear here once voting begins.</p>
      </div>
    );
  }

  const chartData = stats.candidates.map((candidate, index) => ({
    name: candidate.name,
    value: candidate.votes,
    percentage: candidate.percentage,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pie Chart Visualization */}
      <Card className="rounded-xl shadow-lg border border-neutral-200">
        <CardHeader className="px-6 py-4 border-b border-neutral-200">
          <CardTitle className="text-xl font-semibold text-neutral-900 flex items-center">
            <BarChart3 className="mr-2 text-primary" />
            Vote Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percentage }) => `${percentage}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} votes`, 
                    name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card className="rounded-xl shadow-lg border border-neutral-200">
        <CardHeader className="px-6 py-4 border-b border-neutral-200">
          <CardTitle className="text-xl font-semibold text-neutral-900 flex items-center">
            <TrendingUp className="mr-2 text-primary" />
            Detailed Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {stats.candidates.map((candidate, index) => (
              <div key={candidate.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-neutral-600">
                        {candidate.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{candidate.name}</h4>
                      <p className="text-sm text-neutral-600">{candidate.party}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900">{candidate.votes.toLocaleString()}</div>
                    <div className="text-sm text-neutral-600">{candidate.percentage}%</div>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${candidate.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.totalVotes.toLocaleString()}</div>
                <div className="text-sm text-neutral-600">Total Votes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.turnoutPercentage}%</div>
                <div className="text-sm text-neutral-600">Estimated Turnout</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

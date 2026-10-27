import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/bays_screen.dart';
import 'screens/retention_screen.dart';
import 'screens/fleet_screen.dart';
import 'widgets/agentic_ai_chatbot_sheet.dart';

void main() {
  runApp(const ApexAutoWorksApp());
}

class ApexAutoWorksApp extends StatelessWidget {
  const ApexAutoWorksApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartCRM',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        primaryColor: const Color(0xFF0F172A),
        cardColor: Colors.white,
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF0F172A),
          secondary: Color(0xFF475569),
          surface: Colors.white,
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const MainWorkshopNavigation(),
    );
  }
}

class MainWorkshopNavigation extends StatefulWidget {
  const MainWorkshopNavigation({Key? key}) : super(key: key);

  @override
  State<MainWorkshopNavigation> createState() => _MainWorkshopNavigationState();
}

class _MainWorkshopNavigationState extends State<MainWorkshopNavigation> {
  int _currentIndex = 0;

  void _navigateTab(int index, {String? defaultBay}) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      DashboardScreen(onNavigateTab: _navigateTab),
      BaysScreen(onNavigateTab: _navigateTab),
      const RetentionScreen(),
      const FleetScreen(),
    ];

    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 260),
        switchInCurve: Curves.easeOutCubic,
        switchOutCurve: Curves.easeInCubic,
        transitionBuilder: (child, animation) {
          return FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0.04, 0),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
          );
        },
        child: KeyedSubtree(
          key: ValueKey<int>(_currentIndex),
          child: screens[_currentIndex],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => AgenticAIChatbotSheet.show(context, onNavigateTab: _navigateTab),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 16),
        label: const Text(
          'Assistant',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 12,
            letterSpacing: 0.2,
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        bottom: true,
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Color(0xFFE2E8F0), width: 1)),
          ),
          child: NavigationBarTheme(
            data: NavigationBarThemeData(
              backgroundColor: Colors.white,
              indicatorColor: const Color(0xFF1E293B),
              labelTextStyle: WidgetStateProperty.resolveWith<TextStyle>((states) {
                if (states.contains(WidgetState.selected)) {
                  return const TextStyle(color: Color(0xFF0F172A), fontSize: 11, fontWeight: FontWeight.w800);
                }
                return const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w500);
              }),
              iconTheme: WidgetStateProperty.resolveWith<IconThemeData>((states) {
                if (states.contains(WidgetState.selected)) {
                  return const IconThemeData(color: Colors.white, size: 20);
                }
                return const IconThemeData(color: Color(0xFF64748B), size: 20);
              }),
            ),
            child: NavigationBar(
              selectedIndex: _currentIndex,
              onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
              elevation: 0,
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.grid_view_rounded),
                  selectedIcon: Icon(Icons.grid_view_rounded),
                  label: 'Overview',
                ),
                NavigationDestination(
                  icon: Icon(Icons.car_repair_outlined),
                  selectedIcon: Icon(Icons.car_repair_rounded),
                  label: 'Bays',
                ),
                NavigationDestination(
                  icon: Icon(Icons.chat_bubble_outline_rounded),
                  selectedIcon: Icon(Icons.chat_bubble_rounded),
                  label: 'Reminders',
                ),
                NavigationDestination(
                  icon: Icon(Icons.people_outline_rounded),
                  selectedIcon: Icon(Icons.people_rounded),
                  label: 'Customers',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

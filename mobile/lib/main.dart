import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/intake_screen.dart';
import 'screens/bays_screen.dart';
import 'screens/retention_screen.dart';
import 'screens/fleet_screen.dart';

void main() {
  runApp(const SmartCRMMobileApp());
}

class SmartCRMMobileApp extends StatelessWidget {
  const SmartCRMMobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartCRM Floor PIC',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: Colors.amber,
        colorScheme: ColorScheme.dark(
          primary: Colors.amber,
          secondary: Colors.amber.shade700,
          surface: const Color(0xFF1E293B),
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const MainFloorNavigation(),
    );
  }
}

class MainFloorNavigation extends StatefulWidget {
  const MainFloorNavigation({Key? key}) : super(key: key);

  @override
  State<MainFloorNavigation> createState() => _MainFloorNavigationState();
}

class _MainFloorNavigationState extends State<MainFloorNavigation> {
  int _currentIndex = 0;

  void _navigateTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      DashboardScreen(onNavigateTab: _navigateTab),
      IntakeScreen(onIntakeCreated: () => _navigateTab(2)), // Move to Bays after intake
      const BaysScreen(),
      const RetentionScreen(),
      const FleetScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          backgroundColor: const Color(0xFF1E293B),
          indicatorColor: Colors.amber.withOpacity(0.2),
          labelTextStyle: MaterialStateProperty.resolveWith<TextStyle>((states) {
            if (states.contains(MaterialState.selected)) {
              return const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold);
            }
            return const TextStyle(color: Colors.white54, fontSize: 11);
          }),
          iconTheme: MaterialStateProperty.resolveWith<IconThemeData>((states) {
            if (states.contains(MaterialState.selected)) {
              return const IconThemeData(color: Colors.amber, size: 22);
            }
            return const IconThemeData(color: Colors.white54, size: 22);
          }),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard_rounded),
              label: 'Overview',
            ),
            NavigationDestination(
              icon: Icon(Icons.add_task_outlined),
              selectedIcon: Icon(Icons.add_task_rounded),
              label: 'Intake',
            ),
            NavigationDestination(
              icon: Icon(Icons.view_kanban_outlined),
              selectedIcon: Icon(Icons.view_kanban_rounded),
              label: 'Bays',
            ),
            NavigationDestination(
              icon: Icon(Icons.notifications_active_outlined),
              selectedIcon: Icon(Icons.notifications_active_rounded),
              label: 'Retention',
            ),
            NavigationDestination(
              icon: Icon(Icons.directions_car_outlined),
              selectedIcon: Icon(Icons.directions_car_rounded),
              label: 'Fleet',
            ),
          ],
        ),
      ),
    );
  }
}
